# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import CourseType
from data.graphql_schema.inputs import CourseCreationInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# creating a course
class CreateCourse(graphene.Mutation):

    class Arguments:
        course_data = CourseCreationInput(required=True)

    ok = graphene.Boolean()
    course = graphene.Field(CourseType)
    msg = graphene.JSONString()

    def mutate(self, info, course_data):
        
        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return CreateCourse(ok=False, msg=public_msg['not_login'])

        try:

            # start end time validation
            start_time = course_data['start_time']
            end_time = course_data['end_time']
            if start_time >= end_time or end_time.replace(tzinfo=None) <= datetime.now():
                return CreateCourse(ok=False, msg=create_msg(4111, "开始时间%s大于结束时间%s"%(start_time, end_time)))
            
            # isteacher validation
            if realuser.usertype.lower() == 'teacher':
                serial = serializers.HWFCourseClassSerializer(data=course_data)
                if serial.is_valid():
                    new_course = serial.save()
                    new_course.teachers.add(realuser)
                return CreateCourse(ok=True, course=new_course, msg=public_msg['success'])
            else:
                return CreateCourse(ok=False, msg=public_msg['forbidden'])
        
        # bad request
        except:
            return CreateCourse(ok=False, msg=public_msg['badreq'])
