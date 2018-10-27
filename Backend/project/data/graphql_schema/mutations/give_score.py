from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import SubmissionType
from data.graphql_schema.inputs import ScoreGivingInput

from data.graphql_schema import except_resp as Exresp

# giving score to a submission
class GiveScore(graphene.Mutation):

    class Arguments:
        score_giving_data = ScoreGivingInput(required=True)

    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)

    def mutate(self, info, score_giving_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return Exresp.forbidden_resp

        editing_submission = models.HWFSubmission.objects.get(pk=score_giving_data['submission'])
        editing_course = editing_submission.assignment.course_class

        # isteacher or isassistant validation
        if len(editing_course.teachers.filter(pk=realuser.id)) == 0 and len(editing_course.teaching_assistants.filter(pk=realuser.id)) == 0:
            return Exresp.forbidden_resp
        else:
            editing_submission.score = score_giving_data['score']
            if 'is_excellent' in score_giving_data:
                editing_submission.is_excellent = score_giving_data['is_excellent']
            editing_submission.save()
            return GiveScore(ok=True, submission=editing_submission)

    