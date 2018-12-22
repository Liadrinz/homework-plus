# -*- coding: utf-8 -*-
from datetime import datetime
from threading import Thread

import graphene
from django import http

from data import encrypt, models, serializers
from data.proceeding import autozip, imgs2pdf
from data.graphql_schema.inputs import SubmissionCreationInput
from data.graphql_schema.types import SubmissionType
from data.user_views import token

from data.graphql_schema.resp_msg import public_msg, create_msg

# creating a submission
class CreateSubmission(graphene.Mutation):

    class Arguments:
        submission_data = SubmissionCreationInput(required=True)
    
    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)
    msg = graphene.String()

    def mutate(self, info, submission_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                print('wechat valid')
            except:
                return CreateSubmission(ok=False, msg=public_msg['not_login'])
        
        try:

            # type validation
            if 'addfile' in submission_data:
                if models.HWFAssignment.objects.get(pk=submission_data['assignment']).type == 'image':
                    return CreateSubmission(ok=False, msg=create_msg(4121, "submission of image type are not allowed to obtain an \"addfile\" field"))

            # time validation
            if datetime.now() > models.HWFAssignment.objects.get(pk=submission_data['assignment']).deadline.replace(tzinfo=None):
                return CreateSubmission(ok=False, msg=create_msg(4122, "deadline expired"))
            
            viewing_course = models.HWFAssignment.objects.get(pk=submission_data['assignment']).course_class

            # is authentic student
            if len(viewing_course.students.filter(pk=realuser.pk)) == 0:
                return CreateSubmission(ok=False, msg=create_msg(4123, "you are not a student of this course"))
            
            # field supplement
            submission_data['submitter'] = realuser.pk

            if 'image' in submission_data:
                submission_data['aware'] = False

            if 'image' in submission_data:
                new_submission = models.HWFSubmission.objects.create(
                    description=submission_data['description'],
                    assignment_id=submission_data['assignment'],
                    submitter_id=realuser.pk
                )
                new_submission.image.set(submission_data['image'])
            elif 'addfile' in submission_data:
                if 'image' in submission_data:
                    new_submission = models.HWFSubmission.objects.create(
                        description=submission_data['description'],
                        assignment_id=submission_data['assignment'],
                        submitter_id=realuser.pk
                    )
                    new_submission.image.set(submission_data['image'])
                    new_submission.addfile.set(submission_data['addfile'])
                else:
                    new_submission = models.HWFSubmission.objects.create(
                        description=submission_data['description'],
                        assignment_id=submission_data['assignment'],
                        submitter_id=realuser.pk
                    )
                    new_submission.addfile.set(submission_data['addfile'])

            if 'image' in submission_data:
                convert_thread = Thread(target=generate_pdf_for_submission, args=(submission_data['image'], new_submission.pk, realuser, submission_data.get('enhance', False)))
                convert_thread.setDaemon(False)
                convert_thread.start()
            if 'addfile' in submission_data:
                zip_thread = Thread(target=zip_files_for_submission, args=(submission_data['addfile'], new_submission.pk, realuser))
                zip_thread.setDaemon(False)
                zip_thread.start()

            return CreateSubmission(ok=True, submission=new_submission, msg=public_msg['success'])
        
        # bad request
        except:
            return CreateSubmission(ok=False, msg=public_msg['badreq'])


# create pdf file, using another thread.
def generate_pdf_for_submission(image_id_list, new_submission_id, realuser, enhance=False):
    filter_condition = models.models.Q(pk=None)
    for image_id in image_id_list:
        filter_condition = filter_condition | models.models.Q(pk=image_id)
    image_path_root = 'data/backend_media/'
    pdf_path_root = 'data/backend_media/homework_pdf/'
    image_path_list = []
    for image_file in models.HWFFile.objects.filter(filter_condition):
        image_path_list.append(image_path_root + str(image_file.data))
    pdf_name = image_path_list[0].split('/')[-1].split('.')[0]
    imgs2pdf.convert(image_path_list, pdf_path_root, outputName=pdf_name, enhance=enhance)
    new_pdf = models.HWFFile.objects.create(data='homework_pdf/' + pdf_name + '.pdf', initial_upload_user_id=realuser.pk)
    target_submission = models.HWFSubmission.objects.get(pk=new_submission_id)
    target_submission.pdf_id = new_pdf.pk
    target_submission.aware = True
    target_submission.save()

# zip all addfiles as one
def zip_files_for_submission(addfile_id_list, new_submission_id, realuser):
    filter_condition = models.models.Q(pk=None)
    for addfile_id in addfile_id_list:
        filter_condition = filter_condition | models.models.Q(pk=addfile_id)
    addfile_path_root = 'data/backend_media/'
    addfile_path_list = []
    for addfile in models.HWFFile.objects.filter(filter_condition):
        addfile_path_list.append(addfile_path_root + str(addfile.data))
    zip_name = addfile_path_list[0].split('/')[-1].split('.')[0]
    autozip.CreateZip(addfile_path_list, zip_name)
    new_zip = models.HWFFile.objects.create(data='homework_file/' + zip_name + '.zip', initial_upload_user_id=realuser.pk)
    target_submission = models.HWFSubmission.objects.get(pk=new_submission_id)
    target_submission.addfile.set([new_zip.pk])
    target_submission.save()
    for addfile_id in addfile_id_list:
        models.HWFFile.objects.get(pk=addfile_id).delete()