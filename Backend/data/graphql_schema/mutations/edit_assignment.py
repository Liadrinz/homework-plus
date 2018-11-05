# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentEditionInput

from data.graphql_schema.resp_msg import public_msg, create_msg


# editing an assignment
class EditAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentEditionInput(required=True)

    ok = graphene.Boolean()
    assignment = graphene.Field(AssignmentType)
    msg = graphene.String()

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
                return EditAssignment(ok=False, msg=public_msg['not_login'])

        try:

            # time validation
            if datetime.now() > editing_assignment.deadline.replace(tzinfo=None):
                return EditAssignment(ok=False, msg=create_msg(4151, "该作业截止日期已过，无法修改"))

            # owner validation
            if len(editing_assignment.course_class.teachers.filter(pk=realuser.id)) == 0 or len(editing_assignment.course_class.teaching_assistants.filter(pk=realuser.id)) == 0:
                return EditAssignment(ok=False, msg=public_msg['forbidden'])
            else:
                if 'name' in assignment_data:
                    editing_assignment.name = assignment_data['name']
                if 'description' in assignment_data:
                    editing_assignment.description = assignment_data['description']

                # type validation
                if 'assignment_type' in assignment_data:
                    if assignment_data['assignment_type'] in ('image', 'docs', 'vary'):
                        editing_assignment.type = assignment_data['assignment_type']
                    else:
                        return EditAssignment(ok=False, msg=create_msg(4101, "%s不是合法的作业类型"%assignment_data['assignment_type']))

                if 'addfile' in assignment_data:
                    for file_id in assignment_data['addfile']:
                        editing_assignment.addfile.add(models.HWFFile.objects.get(pk=file))
                if 'deadline' in assignment_data:
                    editing_assignment.deadline = assignment_data['deadline']

                editing_assignment.save()
                return EditAssignment(ok=True, assignment=editing_assignment, msg=public_msg['success'])
        
        # bad request
        except:
            return EditAssignment(ok=False, msg=public_msg['badreq'])
