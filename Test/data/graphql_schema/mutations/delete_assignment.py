# -*- coding: utf-8 -*-
from datetime import datetime

import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentDeletionInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# deleting an assignment
class DeleteAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentDeletionInput(required=True)
    
    ok = graphene.Boolean()
    assignments = graphene.List(of_type=AssignmentType)
    msg = graphene.String()

    def mutate(self, info, assignment_data):
        
        # id validation
        realuser = models.User.objects.filter(pk=info.context.META['realuser']).first()
        if realuser == None:
            return DeleteAssignment(ok=False, msg=public_msg['not_login'])
        
        try:

            ids_to_del = assignment_data['ids']
            del_list = []

            for id in ids_to_del:
                to_del = models.HWFAssignment.objects.get(pk=id)

                # deadline validation
                if datetime.now() > to_del.deadline.replace(tzinfo=None):
                    return DeleteAssignment(ok=False, msg=create_msg(4141, "fail to delete ,deadline expired."))

                # owner validation
                if len(to_del.course_class.teachers.filter(pk=realuser.id)):
                    del_list.append(models.HWFAssignment.objects.get(pk=id))
                    models.HWFAssignment.objects.get(pk=id).delete()
                else:
                    return DeleteAssignment(ok=False, msg=public_msg['forbidden'])
            
            return DeleteAssignment(ok=True, assignments=del_list, msg=public_msg['success'])
        
        # bad request
        except:
            return DeleteAssignment(ok=False, msg=public_msg['badreq'])