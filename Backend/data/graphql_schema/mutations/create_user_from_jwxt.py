# -*- coding: utf-8 -*-
import graphene
from django import http
from data.encrypt import getHash

from data import models, serializers
from data.graphql_schema.types import UserType
from data.graphql_schema.inputs import JwxtLoginInput

from data.graphql_schema.resp_msg import public_msg, create_msg

from data.jwxt.bupt_login import login_jwxt, get_info
from data.user_views import login

# 从教务注册用户
class CreateUserFromJwxt(graphene.Mutation):

    class Arguments:
        jwxt_login_data = JwxtLoginInput(required=True)
    
    ok = graphene.Boolean()
    user = graphene.Field(UserType)
    msg = graphene.String()

    def mutate(self, info, jwxt_login_data):
        login_jwxt(**jwxt_login_data)
        result = get_info()
        if result == {}:
            return CreateUserFromJwxt(ok=False, msg=public_msg['forbidden'])
        target_user = models.User.objects.filter(bupt_id=result['学号']).first()
        if not target_user:
            if '入学日期' in result and '班级' in result:
                new_user = models.User.objects.create(
                    username=jwxt_login_data['username'],
                    name=result['姓名'],
                    gender=["male", "female"][result['性别'] == "female"],
                    usertype="student",
                    bupt_id=jwxt_login_data['username'],
                    class_number=["noClass", result['班级']]['班级' in result]
                )
                new_user.set_password(jwxt_login_data['password'])
                new_user.save()
            else:
                new_user = models.User.objects.create(
                    username=jwxt_login_data['username'],
                    name=result['姓名'],
                    gender=["male", "female"][result['性别'] == "female"],
                    usertype="teacher",
                    password=jwxt_login_data['password'],
                    bupt_id=jwxt_login_data['username']
                )
            return CreateUserFromJwxt(ok=True, user=new_user, msg=public_msg['success'])
        else:
            return CreateUserFromJwxt(ok=False, user=target_user, msg=create_msg(4231, '用户已存在'))
        
        
