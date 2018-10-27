from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentEditionInput

from data.graphql_schema import except_resp as Exresp


# editing an assignment
class EditAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentEditionInput(required=True)

    ok = graphene.Boolean()
    assignment = graphene.Field(AssignmentType)

    def mutate(self, info, assignment_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
            editing_assignment = models.HWFAssignment.objects.get(pk=assignment_data['id'])
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                editing_assignment = models.HWFAssignment.objects.get(pk=assignment_data['id'])
            except:
                return Exresp.forbidden_resp

        # time validation
        if datetime.now() > editing_assignment.deadline.replace(tzinfo=None):
            return Exresp.deadline_expired_resp

        if datetime.now() > editing_assignment.course_class.end_time.replace(tzinfo=None):
            return Exresp.deadline_expired_resp

        # owner validation
        if len(editing_assignment.course_class.teachers.filter(pk=realuser.id)) == 0 or len(editing_assignment.course_class.teaching_assistants.filter(pk=realuser.id)) == 0:
            return Exresp.forbidden_resp
        else:
            if 'name' in assignment_data:
                editing_assignment.name = assignment_data['name']
            if 'description' in assignment_data:
                editing_assignment.description = assignment_data['description']

            # type validation
            if 'type' in assignment_data:
                if assignment_data['type'] in ('image', 'docs', 'all'):
                    editing_assignment.type = assignment_data['type']
                else:
                    return Exresp.invalid_type_resp

            if 'addfile' in assignment_data:
                for file_id in assignment_data['addfile']:
                    editing_assignment.addfile.add(models.HWFFile.objects.get(pk=file))
            if 'deadline' in assignment_data:
                editing_assignment.deadline = assignment_data['deadline']
            editing_assignment.save()
            return EditAssignment(ok=True, assignment=editing_assignment)
