# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http
from threading import Thread

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import WeightSettingInput

from data.graphql_schema.resp_msg import public_msg, create_msg

from django.core.exceptions import ObjectDoesNotExist

# setting all weights to a course
class SetWeights(graphene.Mutation):

    class Arguments:
        weight_data = WeightSettingInput(required=True)

    ok = graphene.Boolean()
    assignments = graphene.List(of_type=AssignmentType)
    msg = graphene.String()

    def mutate(self, info, weight_data):

        # id validation
        realuser = models.User.objects.filter(pk=info.context.META['realuser']).first()
        if realuser == None:
            return SetWeights(ok=False, msg=public_msg['not_login'])
        
        try:
            for assignment_pk in weight_data['assignments']:
                target_assignment = models.HWFAssignment.objects.get(pk=assignment_pk)
                if (len(target_assignment.course_class.teachers.filter(pk=realuser.pk)) == 0) and (len(target_assignment.course_class.teaching_assistants.filter(pk=realuser.pk)) == 0):
                    return SetWeights(ok=False, msg=public_msg['forbidden'])
            
            return_list = []
            for i in range(len(weight_data['assignments'])):
                target_assignment = models.HWFAssignment.objects.get(pk=weight_data['assignments'][i])
                target_assignment.weight = weight_data['weights'][i]
                target_assignment.save()
                return_list.append(target_assignment)

            thread = Thread(target=auto_calc_total, args=(return_list,))
            thread.setDaemon(False)
            thread.start()

            return SetWeights(ok=True, msg=public_msg['success'], assignments=return_list)
        
        except Exception as e:
            print(e)
            return SetWeights(ok=False, msg=public_msg['badreq'])


def auto_calc_total(return_list):
    for target_assignment in return_list:
        for target in target_assignment.course_class.students.all():
            target_pk = target.pk
            # calculate the total marks
            count = 0
            total = 0.0
            average = 0.0
            for assignment in target_assignment.course_class.course_assignments.all():
                submission_score = 0
                try:
                    target_submission = assignment.assignment_submissions.get(submitter_id=target_pk)
                    submission_score = target_submission.score
                except ObjectDoesNotExist:
                    pass
                average += assignment.weight * submission_score
                total += submission_score
                count += 1
            if average == 0.0:
                average = total / count
            try:
                # 已有记录, 则覆盖
                record = models.TotalMarks.objects.get(student_id=target_pk, course_class_id=target_assignment.course_class_id)
                record.average = average
                record.total = total
                record.save()
            except ObjectDoesNotExist:
                # 没有记录, 则创建
                new_record = models.TotalMarks.objects.create(student_id=target_pk, course_class_id=target_assignment.course_class_id, total=total, average=average)
                new_record.save()