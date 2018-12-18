# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import CourseType
from data.graphql_schema.inputs import CourseEditionInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# editing a course
class EditCourse(graphene.Mutation):

    class Arguments:
        course_data = CourseEditionInput(required=True)

    ok = graphene.Boolean()
    course = graphene.Field(CourseType)
    msg = graphene.String()

    def mutate(self, info, course_data):

        is_from_wechat = False
        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
            editing_course = models.HWFCourseClass.objects.get(pk=course_data['id'])
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                editing_course = models.HWFCourseClass.objects.get(pk=course_data['id'])
                is_from_wechat = True
            except:
                return EditCourse(ok=False, msg=public_msg['not_login'])
        try:

            # usertype validation
            if is_from_wechat:
                if 'students' in course_data:
                    student_id = course_data['students'][0]
                    if student_id == realuser.pk:
                        editing_course.students.add(models.User.objects.get(pk=student_id))
                    else:
                        return EditCourse(ok=False, msg=public_msg['forbidden'])

            elif len(editing_course.teachers.filter(pk=realuser.id)) == 0:
                if len(editing_course.teaching_assistants.filter(pk=realuser.id)) == 0:
                    # neither assistant nor teacher
                    return EditCourse(ok=False, msg=public_msg['forbidden'])
                # is assistant
                else:
                    if 'description' in course_data:
                        editing_course.description = course_data['description']
                    if 'marks' in course_data:
                        editing_course.marks = course_data['marks']
                    if 'students' in course_data:
                        for student_id in course_data['students']:
                            editing_course.students.add(models.User.objects.get(pk=student_id))
                    if 'school' in course_data:
                        editing_course.school = course_data['school']
                    if 'start_time' in course_data:
                        editing_course.start_time = course_data['start_time']
                    if 'end_time' in course_data:
                        editing_course.end_time = course_data['end_time']
                    editing_course.save()
                    return EditCourse(ok=True, course=editing_course, msg=public_msg['success'])
            # is teacher
            else:
                if 'name' in course_data:
                    editing_course.name = course_data['name']
                if 'description' in course_data:
                    editing_course.description = course_data['description']
                if 'marks' in course_data:
                    editing_course.marks = course_data['marks']
                if 'teachers' in course_data:
                    for teacher_id in course_data['teachers']:
                        editing_course.teachers.add(models.User.objects.get(pk=teacher_id))
                if 'teaching_assistants' in course_data:
                    for teaching_assistant_id in course_data['teaching_assistants']:
                        editing_course.teaching_assistants.add(models.User.objects.get(pk=teaching_assistant_id))
                if 'students' in course_data:
                    for student_id in course_data['students']:
                        editing_course.students.add(models.User.objects.get(pk=student_id))
                if 'school' in course_data:
                    editing_course.school = course_data['school']
                if 'start_time' in course_data:
                    editing_course.start_time = course_data['start_time']
                if 'end_time' in course_data:
                    editing_course.end_time = course_data['end_time']
                editing_course.save()
                return EditCourse(ok=True, course=editing_course, msg=public_msg['success'])
        
        # bad request
        except:
            return EditCourse(ok=False, msg=public_msg['badreq'])
