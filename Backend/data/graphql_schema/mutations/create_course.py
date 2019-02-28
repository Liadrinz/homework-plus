# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
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
        realuser = models.User.objects.filter(pk=info.context.META['realuser']).first()
        if realuser == None:
            return CreateCourse(ok=False, msg=public_msg['not_login'])

        try:

            # start end time validation
            start_time = course_data['start_time']
            end_time = course_data['end_time']
            if start_time >= end_time or end_time.replace(tzinfo=None) <= datetime.now():
                return CreateCourse(ok=False, msg=create_msg(4111, "the start time \"%s\" is later than the end time \"%s\""%(start_time, end_time)))
            
            # isteacher validation
            if realuser.usertype.lower() == 'teacher':
                teachers = course_data.pop('teachers', [])
                assistants = course_data.pop('teaching_assistants', [])
                students = course_data.pop('students', [])
                # fk validation
                pk = 0
                try:
                    for pk in teachers + assistants + students:
                        models.User.objects.get(pk=pk)
                except:
                    return CreateCourse(ok=False, msg=create_msg(4112, "user %d cannot be found" % pk))

                serial = serializers.HWFCourseClassSerializer(data=course_data)
                if serial.is_valid():
                    new_course = serial.save()
                    new_course.teachers.add(realuser)
                    for item in teachers:
                        new_course.teachers.add(models.User.objects.get(pk=item))
                    for item in students:
                        new_course.students.add(models.User.objects.get(pk=item))
                    for item in assistants:
                        new_course.teaching_assistants.add(models.User.objects.get(pk=item))
                    return CreateCourse(ok=True, course=new_course, msg=public_msg['success'])
            else:
                return CreateCourse(ok=False, msg=public_msg['forbidden'])
        
        # bad request
        except Exception as e:
            print(e)
            return CreateCourse(ok=False, msg=public_msg['badreq'])
