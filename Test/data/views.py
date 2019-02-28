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
    name = token.generate_validate_token(str(request.data['course_id']))
    qr.save("./data/backend_media/invitation_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/invitation_qr/"+name+".jpg","vtk":new_token})


# 获取绑定微信的二维码
@api_view(['POST'])
def bind_wechat(request):
    qr = qrcode.make("http://"+BACKEND_DOMIAN+"data/users/"+str(request.data['user_id']))
    name = token.generate_validate_token(str(request.data['user_id']))
    qr.save("./data/backend_media/bind_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/bind_qr/"+name+".jpg","vtk":name})


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
