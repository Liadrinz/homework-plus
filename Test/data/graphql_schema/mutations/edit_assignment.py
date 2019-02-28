# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
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

        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()

        editing_assignment = models.HWFAssignment.objects.get(
            pk=assignment_data['id'])
        try:

            # time validation
            if datetime.now() > editing_assignment.deadline.replace(
                    tzinfo=None):
                return EditAssignment(
                    ok=False, msg=create_msg(4151, "该作业截止日期已过，无法修改"))

            # owner validation
            if len(
                    editing_assignment.course_class.teachers.filter(
                        pk=realuser.id)) == 0 or len(
                            editing_assignment.course_class.
                            teaching_assistants.filter(pk=realuser.id)) == 0:
                return EditAssignment(ok=False, msg=public_msg['forbidden'])
            else:
                # file validation
                fid = 0
                try:
                    for fid in addfile:
                        models.HWFFile.objects.get(fid)
                except:
                    return EditAssignment(
                        ok=False,
                        msg=create_msg(4103, "file %d cannot be found" % fid))
                if 'name' in assignment_data:
                    editing_assignment.name = assignment_data['name']
                if 'description' in assignment_data:
                    editing_assignment.description = assignment_data[
                        'description']

                # type validation
                if 'assignment_type' in assignment_data:
                    if assignment_data['assignment_type'] in ('image', 'docs',
                                                              'vary'):
                        editing_assignment.type = assignment_data[
                            'assignment_type']
                    else:
                        return EditAssignment(
                            ok=False,
                            msg=create_msg(
                                4101, "\"%s\" is not a valid assignment type" %
                                assignment_data['assignment_type']))

                if 'addfile' in assignment_data:
                    # file validation
                    fid = 0
                    try:
                        for fid in assignment_data['addfile']:
                            models.HWFFile.objects.get(fid)
                    except:
                        return EditAssignment(
                            ok=False,
                            msg=create_msg(4103,
                                           "file %d cannot be found" % fid))
                    for file_id in assignment_data['addfile']:
                        editing_assignment.addfile.add(
                            models.HWFFile.objects.get(pk=file_id))
                if 'deadline' in assignment_data:
                    # time validation
                    if assignment_data['deadline'].replace(
                            tzinfo=None) < datetime.now():
                        return CreateAssignment(
                            ok=False,
                            msg=create_msg(
                                4102, "\"%s\" is an expired datetime" %
                                assignment_data['deadline']))
                    editing_assignment.deadline = assignment_data['deadline']

                if 'weight' in assignment_data:
                    editing_assignment.weight = assignment_data['weight']

                editing_assignment.save()
                return EditAssignment(
                    ok=True,
                    assignment=editing_assignment,
                    msg=public_msg['success'])

        # bad request
        except:
            return EditAssignment(ok=False, msg=public_msg['badreq'])
