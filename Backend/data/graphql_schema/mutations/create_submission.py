from datetime import datetime
from threading import Thread

import graphene
from django import http

from data import encrypt, imgs2pdf, models, serializers
from data.graphql_schema import except_resp as Exresp
from data.graphql_schema.inputs import SubmissionCreationInput
from data.graphql_schema.types import SubmissionType
from data.user_views import token


# creating a submission
class CreateSubmission(graphene.Mutation):

    class Arguments:
        submission_data = SubmissionCreationInput(required=True)
    
    ok = graphene.Boolean()
    submission = graphene.Field(SubmissionType)

    def mutate(self, info, submission_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return Exresp.forbidden_resp
        
        # type validation
        if 'addfile' in submission_data:
            if models.HWFAssignment.objects.get(pk=submission_data['assignment']).type == 'image':
                return Exresp.invalid_type_resp

        # time validation
        if datetime.now() > models.HWFAssignment.objects.get(pk=submission_data['assignment']).deadline.replace(tzinfo=None):
            return Exresp.deadline_expired_resp
        
        viewing_course = models.HWFAssignment.objects.get(pk=submission_data['assignment']).course_class

        # is authentic student
        if len(viewing_course.students.filter(pk=realuser.pk)) == 0:
            return Exresp.forbidden_resp
        
        # field supplement
        submission_data['submitter'] = realuser.pk

        if 'image' in submission_data:
            submission_data['aware'] = False

        serial = serializers.HWFSubmissionSerializer(data=submission_data)
        if serial.is_valid():
            new_submission = serial.save()
            if 'image' in submission_data:
                convert_thread = Thread(target=generate_pdf_for_submission, args=(submission_data['image'], new_submission.pk, realuser))
                convert_thread.start()
            return CreateSubmission(ok=True, submission=new_submission)


# create pdf file, using another thread.
def generate_pdf_for_submission(image_id_list, new_submission_id, realuser):
    filter_condition = models.models.Q(pk=None)
    for image_id in image_id_list:
        filter_condition = filter_condition | models.models.Q(pk=image_id)
    image_path_root = 'data/backend_media/'
    pdf_path_root = 'data/backend_media/homework_pdf/'
    image_path_list = []
    for image_file in models.HWFFile.objects.filter(filter_condition):
        image_path_list.append(image_path_root + str(image_file.data))
    pdf_name = image_path_list[0].split('/')[-1].split('.')[0]
    imgs2pdf.convert(image_path_list, pdf_path_root, outputName=pdf_name)
    new_pdf = models.HWFFile.objects.create(data='homework_pdf/' + pdf_name + '.pdf', initial_upload_user_id=realuser.pk)
    target_submission = models.HWFSubmission.objects.get(pk=new_submission_id)
    target_submission.pdf_id = new_pdf.pk
    target_submission.aware = True
    target_submission.save()
