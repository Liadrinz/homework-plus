from datetime import datetime

import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import AssignmentType
from data.graphql_schema.inputs import AssignmentDeletionInput

from data.graphql_schema import except_resp as Exresp

# deleting an assignment
class DeleteAssignment(graphene.Mutation):

    class Arguments:
        assignment_data = AssignmentDeletionInput(required=True)
    
    ok = graphene.Boolean()
    assignments = graphene.List(of_type=AssignmentType)

    def mutate(self, info, assignment_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
            except:
                return Exresp.forbidden_resp

        ids_to_del = assignment_data['ids']
        del_list = []

        for id in ids_to_del:
            to_del = models.HWFAssignment.objects.get(pk=id)

            # deadline validation
            if datetime.now() > to_del.deadline.replace(tzinfo=None):
                return Exresp.deadline_expired_resp

            # owner validation
            if len(to_del.course_class.teachers.filter(pk=realuser.id)):
                del_list.append(models.HWFAssignment.objects.get(pk=id))
                models.HWFAssignment.objects.get(pk=id).delete()
        
        return DeleteAssignment(ok=True, assignments=del_list)