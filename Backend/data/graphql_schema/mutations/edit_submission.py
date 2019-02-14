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
from data.graphql_schema.mutations.create_submission import aware_vector, aware_vector_lock, generate_pdf_for_submission, zip_files_for_submission


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
        try:
            realuser = token.confirm_validate_token(
                info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(
                    wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                print('wechat valid')
            except:
                return EditSubmission(ok=False, msg=public_msg['not_login'])

        editing_submission = models.HWFSubmission.objects.get(
            pk=submission_data['id'])

        try:

            # type validation
            if 'addfile' in submission_data:
                if editing_submission.assignment.type == 'image':
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

            viewing_course = editing_submission.assignment.course_class

            # is authentic student
            if len(viewing_course.students.filter(pk=realuser.pk)) == 0:
                return EditSubmission(
                    ok=False,
                    msg=create_msg(4123,
                                   "you are not a student of this course"))

            if 'image' in submission_data:
                if aware_vector_lock.acquire():
                    aware_vector[0] = 0
                    editing_submission.aware = False
                    aware_vector_lock.release()
            if 'addfile' in submission_data:
                if aware_vector_lock.acquire():
                    aware_vector[1] = 0
                    editing_submission.aware = False
                    aware_vector_lock.release()

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
