# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import TotalMarksType
from data.graphql_schema.inputs import TotalCalculationInput

from data.graphql_schema.resp_msg import public_msg, create_msg

from django.core.exceptions import ObjectDoesNotExist

# calculate total marks for a student
class CalculateTotal(graphene.Mutation):

    class Arguments:
        calc_target = TotalCalculationInput(required=True)
    
    ok = graphene.Boolean()
    total_marks = graphene.Field(TotalMarksType)
    msg = graphene.String()

    def mutate(self, info, calc_target):
        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return CalculateTotal(ok=False, msg=public_msg['not_login'])
        
        editing_course = models.HWFCourseClass.objects.get(pk=calc_target['course'])

        try:
            
            # is the right teacher or assistant validation
            if len(editing_course.teachers.filter(pk=realuser.pk)) == 0 and len(editing_course.teaching_assistants.filter(pk=realuser.pk)) == 0:
                return CalculateTotal(ok=False, msg=public_msg['forbidden'])
            else:
                # calculate the total marks
                total = 0.0
                for assignment in editing_course.course_assignments.all():
                    submission_score = 0
                    try:
                        target_submission = assignment.assignment_submissions.get(submitter_id=calc_target['student'])
                        submission_score = target_submission.score
                    except ObjectDoesNotExist:
                        pass
                    total += assignment.weight * submission_score
                
                try:
                    # 已有记录, 则覆盖
                    record = models.TotalMarks.objects.get(student_id=calc_target['student'], course_class_id=calc_target['course'])
                    record.total_marks = total
                    record.save()
                    return CalculateTotal(ok=True, msg=public_msg['success'], total_marks=record)
                except ObjectDoesNotExist:
                    # 没有记录, 则创建
                    new_record = models.TotalMarks.objects.create(student_id=calc_target['student'], course_class_id=calc_target['course'], total_marks=total)
                    new_record.save()
                    return CalculateTotal(ok=True, msg=public_msg['success'], total_marks=new_record)

        except Exception as e:
            print(e)
            return CalculateTotal(ok=False, msg=public_msg['badreq'])