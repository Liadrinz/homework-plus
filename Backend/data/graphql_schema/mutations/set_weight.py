# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import WeightSettingInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# setting all weights to a course
class SetWeights(graphene.Mutation):

    class Arguments:
        weight_data = WeightSettingInput(required=True)

    ok = graphene.Boolean()
    assignments = graphene.List(of_type=AssignmentType)
    msg = graphene.String()

    def mutate(self, info, weight_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return SetWeights(ok=False, msg=public_msg['not_login'])
        
        try:
            for assignment_pk in weight_data['assignments']:
                target_assignment = models.HWFAssignment.objects.get(pk=assignment_pk)
                if len(target_assignment.course_class.teachers.filter(pk=realuser.pk)) == 0 and len(target_assignment.course_class.teaching_assistants.filter(pk=realuser.pk)):
                    return SetWeights(ok=False, msg=public_msg['forbidden'])
            
            return_list = []
            for i in range(len(weight_data['assignments'])):
                target_assignment = models.HWFAssignment.objects.get(pk=weight_data['assignments'][i])
                target_assignment.weight = weight_data['weights'][i]
                target_assignment.save()
                return_list.append(target_assignment)
            return SetWeights(ok=True, msg=public_msg['success'], assignments=return_list)
        
        except Exception as e:
            print(e)
            return SetWeights(ok=False, msg=public_msg['badreq'])
