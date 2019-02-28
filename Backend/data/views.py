# -*- coding: utf-8 -*-
import re

import qrcode
from django.http import HttpResponse
from itsdangerous import SignatureExpired
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from data import models, serializers
from data.safe import permissions
from data.safe.tokener import tokener as token
from data.models import User
from project.settings import (API_AUTH_KEY, BACKEND_DOMIAN, FRONTEND_DOMAIN, SECRET_KEY)

from data.encrypt import getHash


# 获取课程的二维码
@api_view(['POST'])
def get_qrcode(request):
    try:
        realuser = token.confirm_validate_token(request.META['HTTP_TOKEN'])
        new_token = token.generate_validate_token(realuser)
    except:
        return Response(data={"error": "forbidden"})
    qr = qrcode.make("http://"+BACKEND_DOMIAN+"/data/courses/"+str(request.data['course_id'])+"?token="+new_token)
    name = str(request.data['course_id'])
    qr.save("./data/backend_media/invitation_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/invitation_qr/"+name+".jpg","vtk":new_token})


# 获取绑定微信的二维码
@api_view(['POST'])
def bind_wechat(request):
    if str(request.data.get('user_id', None)) != str(request.META.get('realuser', None)) or request.META.get('realuser', None) == None:
        return Response(data={"error": "forbidden"})
    qr = qrcode.make("http://"+BACKEND_DOMIAN+"/account/confirm_bind_wechat/?token="+token.generate_validate_token(request.META.get('HTTP_TOKEN', '')))
    name = str(request.data['user_id'])
    qr.save("./data/backend_media/bind_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/bind_qr/"+name+".jpg","vtk":name})


# 绑定微信
@api_view(['GET'])
def confirm_bind_wechat(request):
    bind_token = request.query_params.get('token', None)
    openid = request.query_params.get('openid', None)
    if not bind_token:
        return Response(data={"error": "bad request"})
    try:
        original_token = token.confirm_validate_token(bind_token, expiration=120)
        realuser_pk = token.confirm_validate_token(original_token)
        realuser = User.objects.get(pk=int(realuser_pk))
        if openid:
            realuser.wechat = getHash(openid)
            realuser.save()
            return Response(data="success")
        else:
            return Response(data=serializers.UserSerializer(realuser).data)
    except Exception as e:
        print(e)
        return Response(data={"error": "forbidden"})

# 上传文件(单独的文件)的接口
@api_view(['POST'])
def upload_file(request):
    file = request.FILES.get('data', None)
    tk = request.META['HTTP_TOKEN']
    try:
        realuser = token.confirm_validate_token(tk)
    except:
        try:
            realuser = models.User.objects.get(wechat=getHash(tk)).pk
        except:
            return Response(data={"msg": "forbidden"})
    upload_user_id = realuser
    newfile = models.HWFFile.objects.create(data=file, initial_upload_user_id=upload_user_id)
    return Response(data={"id": newfile.pk})


# 文件(数据库文件对象HWFFile)的REST接口
class HWFFileViewSet(viewsets.ModelViewSet):
    
    queryset = models.HWFFile.objects.all()
    serializer_class = serializers.HWFFileSerializer
