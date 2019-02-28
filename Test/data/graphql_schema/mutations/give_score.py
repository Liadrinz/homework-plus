# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import SubmissionType
from data.graphql_schema.inputs import ScoreGivingInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# giving score to a submission
class GiveScore(graphene.Mutation):

    class Arguments:
        score_giving_data = ScoreGivingInput(required=True)

    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)
    msg = graphene.String()

    def mutate(self, info, score_giving_data):

        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()

        editing_submission = models.HWFSubmission.objects.get(pk=score_giving_data['submission'])
        editing_course = editing_submission.assignment.course_class
        
        try:

            # isteacher or isassistant validation
            if len(editing_course.teachers.filter(pk=realuser.id)) == 0 and len(editing_course.teaching_assistants.filter(pk=realuser.id)) == 0:
                return GiveScore(ok=False, msg=public_msg['forbidden'])
            else:
                # deadline validation 在ddl之前不能批改作业
                if datetime.now() < editing_submission.assignment.deadline.replace(tzinfo=None):
                    return GiveScore(ok=False, msg=create_msg(4181, '时机未到'))

                editing_submission.score = score_giving_data['score']
                if 'is_excellent' in score_giving_data:
                    editing_submission.is_excellent = score_giving_data['is_excellent']
                if 'review_comment' in score_giving_data:
                    editing_submission.review_comment = score_giving_data['review_comment']
                editing_submission.is_reviewed = True
                editing_submission.save()
                return GiveScore(ok=True, submission=editing_submission, msg=public_msg['success'])

        # bad request
        except Exception as e:
            print(e)
            return GiveScore(ok=False, msg=public_msg['badreq'])

    