# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import *

class QuerySubmission(object):

    all_submissions = graphene.List(SubmissionType)
    get_submissions_by_owners = graphene.List(SubmissionType, owners=graphene.List(of_type=graphene.Int))
    get_submissions_by_assignments = graphene.List(SubmissionType, assignments=graphene.List(of_type=graphene.Int))
    get_submissions_by_courses = graphene.List(SubmissionType, courses=graphene.List(of_type=graphene.Int))

    # specific query for submissions
    def resolve_all_submissions(self, info, **kwargs):
        return models.HWFSubmission.objects.all()

    def resolve_get_submissions_by_owners(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for submission in models.HWFSubmission.objects.all():
            if submission.submitter.pk in kwargs['owners']:
                result = result | models.models.Q(pk=submission.pk)
        return models.HWFSubmission.objects.filter(result)

    def resolve_get_submissions_by_assignments(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for submission in models.HWFSubmission.objects.all():
            if submission.assignment.pk in kwargs['assignments']:
                result = result | models.models.Q(pk=submission.pk)
        return models.HWFSubmission.objects.filter(result)

    def resolve_get_submissions_by_courses(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for submission in models.HWFSubmission.objects.all():
            if submission.assignment.course_class.pk in kwargs['courses']:
                result = result | models.models.Q(pk=submission.pk)
        return models.HWFSubmission.objects.filter(result)