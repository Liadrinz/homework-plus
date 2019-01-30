# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import *

class QueryCourse(object):

    all_courses = graphene.List(CourseType)
    get_courses_by_ids = graphene.List(CourseType, ids=graphene.List(of_type=graphene.Int))
    search_courses_by_keywords = graphene.List(CourseType, keywords=graphene.String())
    search_courses_by_name = graphene.List(CourseType, name=graphene.String())
    search_courses_by_teacher_name = graphene.List(CourseType, teacher_name=graphene.String())
    all_teachers = graphene.List(TeacherType)
    all_students = graphene.List(StudentType)
    all_teaching_assistants = graphene.List(TeachingAssistantType)

    # specific query of courses
    def resolve_all_courses(self, info, **kwargs):
        return models.HWFCourseClass.objects.all()

    def resolve_get_courses_by_ids(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in kwargs['ids']:
            result = result | models.models.Q(pk=item)
        return models.HWFCourseClass.objects.filter(result)

    # fuzzy query of coruses
    def resolve_search_courses_by_keywords(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFCourseClass.objects.all():
            if kwargs['keywords'] in item.name:
                result = result | models.models.Q(pk=item.pk)
            if kwargs['keywords'] in item.description:
                result = result | models.models.Q(pk=item.pk)
            for teacher in item.teachers.all():
                if kwargs['keywords'] in teacher.name:
                    result = result | models.models.Q(pk=item.pk)
        return models.HWFCourseClass.objects.filter(result)

    def resolve_search_courses_by_name(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFCourseClass.objects.all():
            if kwargs['name'] in item.name:
                result = result | models.models.Q(pk=item.pk)
        return models.HWFCourseClass.objects.filter(result)

    def resolve_search_courses_by_teacher_name(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFCourseClass.objects.all():
            for teacher in item.teachers.all():
                if kwargs['teacher_name'] in teacher.name:
                    result = result | models.models.Q(pk=item.pk)
        return models.HWFCourseClass.objects.filter(result)

    # get related of course
    def resolve_all_teachers(self, info, **kwargs):
        return models.HWFCourseClass.objects.select_related('teachers').all()

    def resolve_all_students(self, info, **kwargs):
        return models.HWFCourseClass.objects.select_related('students').all()
    
    def resolve_all_teaching_assistants(self, info, **kwargs):
        return models.HWFCourseClass.objects.select_related('teaching_assistants').all()
