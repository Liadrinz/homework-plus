# -*- coding: utf-8 -*-
from datetime import datetime
from threading import Thread

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import encrypt, models, serializers
from data.proceeding import autozip, imgs2pdf
from data.graphql_schema.inputs import SubmissionCreationInput
from data.graphql_schema.types import SubmissionType

from data.graphql_schema.resp_msg import public_msg, create_msg

aware_vector = [1, 1]


# creating a submission
class CreateSubmission(graphene.Mutation):
    class Arguments:
        submission_data = SubmissionCreationInput(required=True)

    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)
    msg = graphene.String()

    def mutate(self, info, submission_data):
        global aware_vector

        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()

        try:

            # type validation
            if 'addfile' in submission_data:
                if models.HWFAssignment.objects.get(
                        pk=submission_data['assignment']
                ).assignment_type == 'image':
                    return CreateSubmission(
                        ok=False,
                        msg=create_msg(
                            4121,
                            "submission of image type are not allowed to obtain an \"addfile\" field"
                        ))

            # time validation
            if datetime.now() > models.HWFAssignment.objects.get(
                    pk=submission_data['assignment']).deadline.replace(
                        tzinfo=None):
                return CreateSubmission(
                    ok=False, msg=create_msg(4122, "deadline expired"))

            viewing_course = models.HWFAssignment.objects.get(
                pk=submission_data['assignment']).course_class

            # is authentic student
            if len(viewing_course.students.filter(pk=realuser.pk)) == 0:
                return CreateSubmission(
                    ok=False,
                    msg=create_msg(4123,
                                   "you are not a student of this course"))

            if 'image' in submission_data:
                # file validation
                fid = 0
                try:
                    for fid in submission_data['image']:
                        models.HWFFile.objects.get(pk=fid)
                except:
                    return CreateSubmission(
                        ok=False,
                        msg=create_msg(4103, "file %d cannot be found" % fid))
                aware_vector[0] = 0
            if 'addfile' in submission_data:
                # file validation
                fid = 0
                try:
                    for fid in submission_data['addfile']:
                        models.HWFFile.objects.get(pk=fid)
                except:
                    return CreateSubmission(
                        ok=False,
                        msg=create_msg(4103, "file %d cannot be found" % fid))
                aware_vector[1] = 0

            new_submission = models.HWFSubmission.objects.create(
                description=submission_data['description'],
                assignment_id=submission_data['assignment'],
                submitter_id=realuser.pk)

            if 'image' in submission_data:
                convert_thread = Thread(
                    target=generate_pdf_for_submission,
                    args=(submission_data['image'], new_submission.pk,
                          realuser, submission_data.get('enhance', False)))
                convert_thread.setDaemon(False)
                convert_thread.start()
            if 'addfile' in submission_data:
                zip_thread = Thread(
                    target=zip_files_for_submission,
                    args=(submission_data['addfile'], new_submission.pk,
                          realuser))
                zip_thread.setDaemon(False)
                zip_thread.start()

            return CreateSubmission(
                ok=True, submission=new_submission, msg=public_msg['success'])

        # bad request
        except Exception as e:
            print(e)
            return CreateSubmission(ok=False, msg=public_msg['badreq'])


# create pdf file, using another thread.
def generate_pdf_for_submission(image_id_list,
                                new_submission_id,
                                realuser,
                                enhance=False):
    global aware_vector
    filter_condition = models.models.Q(pk=None)
    for image_id in image_id_list:
        filter_condition = filter_condition | models.models.Q(pk=image_id)
    image_path_root = 'data/backend_media/'
    pdf_path_root = 'data/backend_media/homework_pdf/'
    image_path_list = []
    for image_file in models.HWFFile.objects.filter(filter_condition):
        image_path_list.append(image_path_root + str(image_file.data))
    pdf_name = image_path_list[0].split('/')[-1].split('.')[0]
    imgs2pdf.convert(
        image_path_list, pdf_path_root, outputName=pdf_name, enhance=enhance)
    new_pdf = models.HWFFile.objects.create(
        data='homework_pdf/' + pdf_name + '.pdf',
        initial_upload_user_id=realuser.pk)
    new_long_pic = models.HWFFile.objects.create(
        data='homework_pdf/' + pdf_name + '.png',
        initial_upload_user_id=realuser.pk)
    target_submission = models.HWFSubmission.objects.get(pk=new_submission_id)
    target_submission.pdf_id = new_pdf.pk
    target_submission.long_picture_id = new_long_pic.pk
    aware_vector[0] = 1
    if aware_vector[1] == 1:
        target_submission.aware = True
    target_submission.save()


# zip all addfiles as one
def zip_files_for_submission(addfile_id_list, new_submission_id, realuser):
    global aware_vector
    filter_condition = models.models.Q(pk=None)
    for addfile_id in addfile_id_list:
        filter_condition = filter_condition | models.models.Q(pk=addfile_id)
    addfile_path_root = 'data/backend_media/'
    addfile_path_list = []
    for addfile in models.HWFFile.objects.filter(filter_condition):
        addfile_path_list.append(addfile_path_root + str(addfile.data))
    zip_name = addfile_path_list[0].split('/')[-1].split('.')[0]
    autozip.CreateZip(addfile_path_list, zip_name)
    new_zip = models.HWFFile.objects.create(
        data='homework_file/' + zip_name + '.zip',
        initial_upload_user_id=realuser.pk)
    target_submission = models.HWFSubmission.objects.get(pk=new_submission_id)
    target_submission.zipped_file_id = new_zip.pk
    for addfile_id in addfile_id_list:
        models.HWFFile.objects.get(pk=addfile_id).delete()
    aware_vector[1] = 1
    if aware_vector[0] == 1:
        target_submission.aware = True
    target_submission.save()
