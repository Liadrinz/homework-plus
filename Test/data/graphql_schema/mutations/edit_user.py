# -*- coding: utf-8 -*-
import graphene
from data.safe.tokener import tokener as token
from django import http

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import UserType
from data.graphql_schema.inputs import UserEditionInput

from data.graphql_schema.resp_msg import public_msg, create_msg

# editing a user
class EditUser(graphene.Mutation):

    class Arguments:
        user_data = UserEditionInput(required=True)

    ok = graphene.Boolean()
    user = graphene.Field(UserType)
    msg = graphene.String()

    def mutate(self, info, user_data):

        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()
        
        try:

            # owner validation
            if editing_user.username == realuser.username:
                if 'username' in user_data:
                    editing_user.username = user_data['username']
                if 'class_number' in user_data:
                    editing_user.class_number = user_data['class_number']
                if 'phone' in user_data:
                    editing_user.phone = user_data['phone']
                editing_user.save()
                ok = True
                return EditUser(user=editing_user, ok=ok, msg=public_msg['success'])
            else:
                return EditUser(ok=False, msg=public_msg['forbidden'])
        
        # bad request
        except:
            return EditUser(ok=False, msg=public_msg['badreq'])
