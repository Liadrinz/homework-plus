# -*- coding: utf-8 -*-
from datetime import datetime
from threading import Thread

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import encrypt, models, serializers
from data.proceeding import autozip, imgs2pdf
from data.graphql_schema.inputs import SubmissionEditionInput
from data.graphql_schema.types import SubmissionType

from data.graphql_schema.resp_msg import public_msg, create_msg
from data.graphql_schema.mutations.create_submission import aware_vector, generate_pdf_for_submission, zip_files_for_submission


# editing a submission
class EditSubmission(graphene.Mutation):
    class Arguments:
        submission_data = SubmissionEditionInput(required=True)

    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)
    msg = graphene.String()

    def mutate(self, info, submission_data):
        global aware_vector

        # id validation
        realuser = models.User.objects.filter(pk=info.context.META['realuser']).first()
        if realuser == None:
            return EditSubmission(ok=False, msg=public_msg['not_login'])

        editing_submission = models.HWFSubmission.objects.get(
            pk=submission_data['id'])

        try:

            # type validation
            if 'addfile' in submission_data:
                if editing_submission.assignment.assignment_type == 'image':
                    return EditSubmission(
                        ok=False,
                        msg=create_msg(
                            4121,
                            "submission of image type are not allowed to obtain an \"addfile\" field"
                        ))

            # time validation
            if datetime.now() > editing_submission.assignment.deadline.replace(
                    tzinfo=None):
                return EditSubmission(
                    ok=False, msg=create_msg(4122, "deadline expired"))

            # owner validation
            if editing_submission.submitter.pk != realuser.pk:
                return EditSubmission(ok=False, msg=create_msg(4191, "it's not your homework"))

            if 'image' in submission_data:
                aware_vector[0] = 0
                editing_submission.aware = False
            if 'addfile' in submission_data:
                aware_vector[1] = 0
                editing_submission.aware = False
            editing_submission.save()

            if 'description' in submission_data:
                editing_submission.description = submission_data['description']
                editing_submission.save()
            if 'image' in submission_data:
                convert_thread = Thread(
                    target=generate_pdf_for_submission,
                    args=(submission_data['image'], editing_submission.pk,
                          realuser, submission_data.get('enhance', False)))
                convert_thread.setDaemon(False)
                convert_thread.start()
            if 'addfile' in submission_data:
                zip_thread = Thread(
                    target=zip_files_for_submission,
                    args=(submission_data['addfile'], editing_submission.pk,
                          realuser))
                zip_thread.setDaemon(False)
                zip_thread.start()

            return EditSubmission(
                ok=True,
                submission=editing_submission,
                msg=public_msg['success'])

        except:
            return EditSubmission(ok=False, msg=public_msg['badreq'])
