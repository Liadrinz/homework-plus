# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import *

class QueryAssignment(object):

    all_assignments = graphene.List(AssignmentType)
    get_assignments_by_ids = graphene.List(AssignmentType, ids=graphene.List(of_type=graphene.Int))
    get_assignments_by_courses = graphene.List(AssignmentType, courses=graphene.List(of_type=graphene.Int))
    get_assignments_by_deadline = graphene.List(AssignmentType, deadline=graphene.DateTime())
    search_assignments_by_name = graphene.List(AssignmentType, name=graphene.String())
    search_asssignments_by_keywords = graphene.List(AssignmentType, keywords=graphene.String())

    # specific query of assignments
    def resolve_all_assignments(self, info, **kwargs):
        return models.HWFAssignment.objects.all()

    def resolve_get_assignments_by_ids(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in kwargs['ids']:
            result = result | models.models.Q(pk=item)
        return models.HWFAssignment.objects.filter(result)

    def resolve_get_assignments_by_courses(self, info, **kwargs):
        result = models.models.Q(course_class_id=None)
        for item in kwargs['courses']:
            result = result | models.models.Q(course_class_id=item)
        return models.HWFAssignment.objects.filter(result)

    def resolve_get_assignments_by_deadline(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFAssignment.objects.all():
            if item.deadline < kwargs['deadline']:
                result = result | models.models.Q(pk=item.pk)
        return models.HWFAssignment.objects.filter(result)

    def resolve_search_assignments_by_name(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFAssignment.objects.all():
            if kwargs['name'] in item.name:
                result = result | models.models.Q(pk=item.pk)
        return models.HWFAssignment.objects.filter(result)

    def resolve_search_assignments_by_keywords(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in models.HWFAssignment.objects.all():
            if kwargs['keywords'] in item.name or kwargs['keywords'] in item.description:
                result = result | models.models.Q(pk=item.pk)
            elif kwargs['keywords'] in item.course_class.name or kwargs['keywords'] in item.course_class.description:
                result = result | models.models.Q(pk=item.pk)
            else:
                course_teachers = item.course_class.teachers.all()
                for teacher in course_teachers:
                    if kwargs['keywords'] in teacher.name:
                        result = result | models.models.Q(pk=item.pk)
                        break
