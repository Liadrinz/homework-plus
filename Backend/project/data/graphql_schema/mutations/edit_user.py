import graphene
from django import http

from data import models, serializers
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import UserType
from data.graphql_schema.inputs import UserEditionInput

from data.graphql_schema import except_resp as Exresp

# editing a user
class EditUser(graphene.Mutation):

    class Arguments:
        user_data = UserEditionInput(required=True)

    ok = graphene.Boolean()
    user = graphene.Field(UserType)

    def mutate(self, info, user_data):

        # id validation
        try:
            realuser = token.confirm_validate_token(info.context.META['HTTP_TOKEN'])
            realuser = models.User.objects.get(pk=realuser)
            editing_user = models.User.objects.get(pk=user_data['id'])
        except:
            try:
                realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                editing_user = models.User.objects.get(pk=user_data['id'])
            except:
                return Exresp.forbidden_resp
        
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
            return EditUser(user=editing_user, ok=ok)
        else:
            return Exresp.forbidden_resp
