from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentCreationInput

from data.graphql_schema import except_resp as Exresp

# creating an assignment
class CreateAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentCreationInput(required=True)

    ok = graphene.Boolean()
    assignment = graphene.Field(AssignmentType)

    def mutate(self, info, assignment_data):
        
        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return Exresp.forbidden_resp
        
        # type validation
        if assignment_data['type'] not in ('image', 'docs', 'all'):
            return Exresp.invalid_type_resp

        # time validation
        if assignment_data['deadline'].replace(tzinfo=None) < datetime.now():
            return Exresp.invalid_type_resp

        editing_course = models.HWFCourseClass.objects.get(pk=assignment_data['course_class'])

        if datetime.now() > editing_course.end_time.replace(tzinfo=None):
            return Exresp.deadline_expired_resp

        # isteacher or isassistant validation
        if len(editing_course.teachers.filter(pk=realuser.id)) == 0 and len(editing_course.teaching_assistants.filter(pk=realuser.id)) == 0:
            return Exresp.forbidden_resp
        else:
            serial = serializers.HWFAssignmentSerializer(data=assignment_data)
            if serial.is_valid():
                new_assignment = serial.save()
            return CreateAssignment(ok=True, assignment=new_assignment)