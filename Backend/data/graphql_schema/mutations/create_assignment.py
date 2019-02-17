# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
import json
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentCreationInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# creating an assignment
class CreateAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentCreationInput(required=True)

    ok = graphene.Boolean()
    assignment = graphene.Field(AssignmentType)
    msg = graphene.JSONString()

    def mutate(self, info, assignment_data):
        
        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return CreateAssignment(ok=False, msg=public_msg['not_login'])
        
        try:

            # type validation
            if assignment_data['assignment_type'] not in ('image', 'docs', 'vary'):
                return CreateAssignment(ok=False, msg=create_msg(4101, "\"%s\" is not a valid assignment type"%assignment_data['assignment_type']))

            # time validation
            if assignment_data['deadline'].replace(tzinfo=None) < datetime.now():
                return CreateAssignment(ok=False, msg=create_msg(4102, "\"%s\" is an expired datetime"%assignment_data['deadline']))

            editing_course = models.HWFCourseClass.objects.get(pk=assignment_data['course_class'])

            if datetime.now() > editing_course.end_time.replace(tzinfo=None):
                return CreateAssignment(ok=False, msg=create_msg(4102, "\"%s\" is an expired datetime"%assignment_data['deadline']))

            # isteacher or isassistant validation
            if len(editing_course.teachers.filter(pk=realuser.id)) == 0 and len(editing_course.teaching_assistants.filter(pk=realuser.id)) == 0:
                return CreateAssignment(ok=False, msg=public_msg['forbiddren'])
            else:
                addfile = assignment_data.pop('addfile', [])
                # file validation
                fid = 0
                try:
                    for fid in addfile:
                        models.HWFFile.objects.get(fid)
                except:
                    return CreateAssignment(ok=False, msg=create_msg(4103, "file %d cannot be found" % fid))
                serial = serializers.HWFAssignmentSerializer(data=assignment_data)
                if serial.is_valid():
                    new_assignment = serial.save()
                    for item in addfile:
                        new_assignment.addfile.add(item)
                    return CreateAssignment(ok=True, assignment=new_assignment, msg=public_msg['success'])
        
        # bad request
        except Exception as e:
            print(e)
            return CreateAssignment(ok=False, msg=public_msg['badreq'])