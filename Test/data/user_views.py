# -*- coding: utf-8 -*-
import re

from itsdangerous import SignatureExpired
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from data.safe.tokener import tokener as token

from data import encrypt, models, serializers
from data.safe.confirm import send_confirm, send_forget
from data.models import User
from project.settings import API_AUTH_KEY, SECRET_KEY


# 登录时返回的状态
results = {
    'SUCCESS': {
        'code': 1000,
        'msg': 'success'
    },
    'INACTIVE': {
        'code': 4020,
        'msg': '用户未激活'
    },
    'EXPIRED': {
        'code': 4030,
        'msg': '身份验证过期，请重新登录',
    },
    'PWD_ERR': {
        'code': 4040,
        'msg': '用户名或密码错误'
    }
}

data = None
headers = None


# 重置数据
def init():
    global data, headers
    data = {
        'result': {
            'code': None,
            'msg': None
        },
        'data': None
    }
    headers = {
        'token': None
    }


# 登录接口
@api_view(['POST', 'HEAD'])
def login(request):
    init()
    global token, data, headers
    try:
        try:
            from_username = request.data['username']
            from_password = request.data['password']
        except:
            openid = request.META['HTTP_TOKEN']
            hs = encrypt.getHash(openid)
            print(hs)
            realuser = User.objects.get(wechat=hs)
            if realuser.is_active == False:
                data['result'] = results['INACTIVE']
                return Response(data=data, headers=headers)
            serializer = serializers.UserSerializer(realuser)
            data['data'] = {key: serializer.data[key]
                            for key in serializer.data if key != 'password'}
            data['result'] = results['SUCCESS']
            return Response(data=data, headers=headers)

    except:
        return Response(data=data, headers=headers)
    
    # username 字段可能是学号、手机、用户名和邮箱
    try:
        realuser = User.objects.get(bupt_id=from_username)
    except:
        try:
            realuser = User.objects.get(phone=from_username)
        except:
            try:
                realuser = User.objects.get(username=from_username)
            except:
                try:
                    realuser = User.objects.get(email=from_username)
                except:
                    return Response(data=data, headers=headers, status=status.HTTP_404_NOT_FOUND)

    # 密码正确
    if realuser.check_password(from_password):
        if realuser.is_active == False:
            data['result'] = results['INACTIVE']
            return Response(data=data, headers=headers)
        serializer = serializers.UserSerializer(realuser)
        validate_token = token.generate_validate_token(realuser.pk)
        headers['token'] = validate_token
        data['data'] = {key: serializer.data[key]
                        for key in serializer.data if key != 'password'}
        data['result'] = results['SUCCESS']
        return Response(data=data, headers=headers)
    else:
        data['result'] = results['PWD_ERR']
        return Response(data=data, headers=headers)

    return Response(data=data, headers=headers, status=status.HTTP_400_BAD_REQUEST)


# TODO: 确认前端未使用后删除
@api_view(['GET', 'POST'])
def user_list(request):
    init()
    global token, data, headers
    # 用户列表接口
    if request.method == 'GET':
        # queryset = User.objects.all()
        # try:
        #     keywords = request.query_params['keywords']
        #     queryset = [obj for obj in queryset if keywords in obj.username or keywords in obj.bupt_id or keywords in obj.name or keywords in obj.email or keywords in obj.phone or keywords in obj.wechat or keywords in obj.class_number]
        # except:
        #     pass
        # serializer = serializers.UserSerializer(
        #     queryset, many=True)
        # data['data'] = serializer.data
        # data['result'] = results['SUCCESS']
        # return Response(data=data, headers=headers)
        try:
            try:
                # 只有登录了才能看哦
                if token.confirm_validate_token(request.META['HTTP_TOKEN']):
                    headers['isLogin'] = True
                    headers['authed'] = True
                    queryset = User.objects.all()
                    try:
                        keywords = request.query_params['keywords']
                        queryset = [obj for obj in queryset if keywords in obj.username or keywords in obj.bupt_id or keywords in obj.name or keywords in obj.email or keywords in obj.phone or keywords in obj.wechat or keywords in obj.class_number]
                    except:
                        pass
                    serializer = serializers.UserSerializer(
                        queryset, many=True)
                    data['data'] = serializer.data
                    data['result'] = results['SUCCESS']
                    return Response(data=data, headers=headers)
            except:
                openid = request.META['HTTP_TOKEN']
                hs = encrypt.getHash(openid)
                if User.objects.get(wechat=hs):
                    queryset = User.objects.all()
                    try:
                        keywords = request.query_params['keywords']
                        queryset = [obj for obj in queryset if keywords in obj.username or keywords in obj.bupt_id or keywords in obj.name or keywords in obj.email or keywords in obj.phone or keywords in obj.wechat or keywords in obj.class_number]
                    except:
                        pass
                    serializer = serializers.UserSerializer(
                        queryset, many=True)
                    data['data'] = serializer.data
                    data['result'] = results['SUCCESS']
                    return Response(data=data, headers=headers)
        except:
            data['result'] = results['EXPIRED']
            headers['expired'] = True
            return Response(headers=headers, data=data)
        else:
            return Response(headers=headers, data=data, status=status.HTTP_403_FORBIDDEN)
    data = {
        'result': {
            'code': None,
            'msg': None
        },
        'data': None
    }
    headers = {
        'isLogin': False,
        'authed': False
    }
    # 注册接口
    if request.method == 'POST':
        request.data['useravatar'] = [2,]
        serializer = serializers.UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            data['result'] = results['SUCCESS']
            send_confirm(User.objects.get(email=request.data['email']))
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# TODO: 确认前端未使用后删除
@api_view(['GET', 'PUT'])
def user_detail(request, pk):
    init()
    global token, data, headers
    try:
        user = User.objects.get(pk=pk)
    except:
        try:
            user = User.objects.get(phone=pk)
        except:
            try:
                user = User.objects.get(bupt_id=pk)
            except:
                try:
                    user = User.objects.get(wechat=pk)
                except:
                    return Response(data=data, headers=headers, status=status.HTTP_404_NOT_FOUND)
    # 获取单个用户信息接口
    # 登录才能看哦
    if request.method == 'GET':
        try:
            try:
                token.confirm_validate_token(request.META['HTTP_TOKEN'])
                headers['isLogin'] = True
                headers['authed'] = True
                serializer = serializers.UserSerializer(user)
                data['data'] = serializer.data
                data['result'] = results['SUCCESS']
                return Response(data=data, headers=headers)
            except:
                openid = request.META['HTTP_TOKEN']
                hs = encrypt.getHash(openid)
                User.objects.get(wechat=hs)
                headers['isLogin'] = True
                headers['authed'] = True
                serializer = serializers.UserSerializer(user)
                data['data'] = serializer.data
                data['result'] = results['SUCCESS']
                return Response(data=data, headers=headers)
        except:
            try:
                found_user = User.objects.get(pk=pk)
                serializer = serializers.UserSerializer(found_user)
                data['data'] = serializer.data
                data['result'] = results['SUCCESS']
                return Response(data=data, headers=headers)
            except:
                data['result'] = results['EXPIRED']
                headers['expired'] = True
                return Response(headers=headers, data=data)
        else:
            return Response(data=data, headers=headers, status=status.HTTP_403_FORBIDDEN)
    # 修改用户信息接口
    # 只有自己才能改哦
    elif request.method == 'PUT':
        try:
            try:
                plain = token.confirm_validate_token(
                    request.META['HTTP_TOKEN'])
            except:
                openid = request.META['HTTP_TOKEN']
                found_user = User.objects.get(pk=pk)
                found_user.wechat = encrypt.getHash(openid)
                found_user.save()
                data['result'] = results['SUCCESS']
                data['data'] = serializers.UserSerializer(found_user).data
                return Response(data=data,headers=headers)
            else:
                try:
                    found_user = User.objects.get(pk=plain)
                except:
                    return Response(data=data, headers=headers, status=status.HTTP_404_NOT_FOUND)
        except SignatureExpired as e:
            data['result'] = results['EXPIRED']
            headers['expired'] = True
            return Response(headers=headers, data=data)

        headers['isLogin'] = True
        if found_user == user:
            headers['authed'] = True
            serializer = serializers.UserSerializer(user, data=request.data)
            if serializer.is_valid():
                serializer.save()
                data['data'] = serializer.data
                data['result'] = results['SUCCESS']
                return Response(data=data, headers=headers)
            else:
                return Response(data=data, headers=headers, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data=data, headers=headers, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
def is_repeated(request):
    init()
    to_judge = request.data['content']
    all_data = User.objects.values_list(request.data['type']).all()
    all_data = [item[0] for item in all_data]
    data['data'] = {"repeat": (to_judge in all_data)}
    return Response(data=data, headers=headers)

# 激活账户


@api_view(['POST'])
def activate(request):
    init()
    global data, headers, token
    userid = token.confirm_validate_token(request.META['HTTP_TOKEN'], expiration=600)
    if userid:
        user_obj = User.objects.get(pk=userid)
        user_obj.is_active = True
        user_obj.save()
        data['result'] = results['SUCCESS']
        serializer = serializers.UserSerializer(user_obj)
        data['data'] = serializer.data
        return Response(data=data, headers=headers)
    else:
        data['result'] = results['EXPIRED']
        return Response(data=data, headers=headers)


@api_view(['POST'])
def change_password(request):
    init()
    global data, headers, token
    vtoken = request.META['HTTP_TOKEN']
    userid = token.confirm_validate_token(vtoken, expiration=600)
    try:
        realuser = User.objects.get(pk=userid)
    except:
        return Response(data=data, headers=headers, status=status.HTTP_404_NOT_FOUND)
    if realuser.check_password(request.data['old_pass']):
        realuser.set_password(request.data['new_pass'])
        realuser.save()
        data['result'] = results['SUCCESS']
        serializer = serializers.UserSerializer(realuser)
        data['data'] = serializer.data
        return Response(data=data, headers=headers)
    else:
        data['result'] = results['PWD_ERR']
        return Response(data=data, headers=headers)


@api_view(['POST'])
def forget_password(request):
    init()
    global data, headers, token
    requser = request.data['username']
    realuser = None
    try:
        realuser = User.objects.get(pk=requser)
    except:
        return Response(data=data, headers=headers, status=status.HTTP_404_NOT_FOUND)

    send_forget(realuser)
    data['result'] = results['SUCCESS']
    serializer = serializers.UserSerializer(realuser)
    data['data'] = serializer.data
    return Response(data=data, headers=headers)


@api_view(['POST'])
def confirm_forgotten(request):
    init()
    global data, headers, token
    userid = token.confirm_validate_token(request.META['HTTP_TOKEN'], expiration=600)
    if userid:
        user_obj = User.objects.get(pk=userid)
        user_obj.forgotten = True
        user_obj.save()
        data['result'] = results['SUCCESS']
        serializer = serializers.UserSerializer(user_obj)
        data['data'] = serializer.data
        return Response(data=data, headers=headers)
    data['result'] = results['EXPIRED']
    return Response(data=data, headers=headers)


@api_view(['POST'])
def directly_change(request):
    init()
    global data, headers, token
    userid = token.confirm_validate_token(request.META['HTTP_TOKEN'], expiration=600)
    if userid:
        usrn_obj = User.objects.get(pk=userid)
        if usrn_obj.forgotten:
            usrn_obj.set_password(request.data['new_pass'])
            usrn_obj.forgotten = False
            usrn_obj.save()
            data['result'] = results['SUCCESS']
            serializer = serializers.UserSerializer(usrn_obj)
            data['data'] = serializer.data
            return Response(data=data, headers=headers)
    return Response(data=data, headers=headers, status=status.HTTP_403_FORBIDDEN)


class UserAvatarViewset(viewsets.ModelViewSet):
    queryset = models.UserAvatar.objects.all()
    serializer_class = serializers.UserAvatarSerializer

    def perform_create(self, serializer):
        vtk = self.request.headers['token']
        userid = token.confirm_validate_token(vtk)
        serializer.save(user = userid)