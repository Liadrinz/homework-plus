# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import *
from data.graphql_schema.resp_msg import create_msg
from data.safe.tokener import tokener as token

# TODO: 学生只能看自己, 老师只能看自己学生
class QueryTotalMarks(object):

    get_total_marks = graphene.List(TotalMarksType, course=graphene.Int(required=False), student=graphene.Int(required=False))

    def resolve_get_total_marks(self, info, **kwargs):
        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()
        if 'student' in kwargs and 'course' in kwargs:
            if realuser.pk != kwargs['student'] and len(models.HWFCourseClass.objects.get(pk=kwargs['course']).teachers.filter(pk=realuser.pk)) == 0:
                return
            return models.TotalMarks.objects.filter(student_id=kwargs['student'], course_class_id=kwargs['course'])
        elif 'student' in kwargs:
            if realuser.pk != kwargs['student']:
                return
            return models.TotalMarks.objects.filter(student_id=kwargs['student'])
        elif 'course' in kwargs:
            if len(models.HWFCourseClass.objects.get(pk=kwargs['course']).teachers.filter(pk=realuser.pk)) == 0:
                return
            return models.TotalMarks.objects.filter(course_class_id=kwargs['course'])
        else:
            return
