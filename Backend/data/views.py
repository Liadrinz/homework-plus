# -*- coding: utf-8 -*-
import re

import qrcode
from django.http import HttpResponse
from itsdangerous import SignatureExpired
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from data import models, permissions, serializers
from data.confirm import ShortToken, Token, send
from data.models import User
from project.settings import (API_AUTH_KEY, BACKEND_DOMIAN, FRONTEND_DOMAIN, SECRET_KEY)

# 有效期为24小时的tokener
token = Token(SECRET_KEY.encode())
# 有效期为1小时的tokener
short_token = ShortToken(SECRET_KEY.encode())


# 获取课程的二维码
@api_view(['POST'])
def get_qrcode(request):
    try:
        realuser = token.confirm_validate_token(request.META['HTTP_TOKEN'])
        new_token = short_token.generate_validate_token(realuser)
    except:
        return Response(data={"error": "forbidden"})
    qr = qrcode.make("http://"+BACKEND_DOMIAN+"/data/courses/"+str(request.data['course_id'])+"?token="+new_token)
    name = short_token.generate_validate_token(str(request.data['course_id']))
    qr.save("./data/backend_media/invitation_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/invitation_qr/"+name+".jpg","vtk":new_token})


# 获取绑定微信的二维码
@api_view(['POST'])
def bind_wechat(request):
    qr = qrcode.make("http://"+BACKEND_DOMIAN+"data/users/"+str(request.data['user_id']))
    name = short_token.generate_validate_token(str(request.data['user_id']))
    qr.save("./data/backend_media/bind_qr/"+name+".jpg")
    return Response(data={"qrcode":"http://"+BACKEND_DOMIAN+"/media/bind_qr/"+name+".jpg","vtk":name})


# 上传文件(单独的文件)的接口
@api_view(['POST'])
def upload_file(request):
    file = request.FILES.get('data', None)
    tk = request.META['HTTP_TOKEN']
    realuser = token.confirm_validate_token(tk)
    upload_user_id = realuser
    newfile = models.HWFFile.objects.create(data=file, initial_upload_user_id=upload_user_id)
    return Response(data={"id": newfile.pk})


# 文件(数据库文件对象HWFFile)的REST接口
class HWFFileViewSet(viewsets.ModelViewSet):
    
    queryset = models.HWFFile.objects.all()
    serializer_class = serializers.HWFFileSerializer
    

"""TODO: 以下接口待删除"""

class HWFQuestionViewSet(viewsets.ModelViewSet):
    queryset = models.HWFQuestion.objects.all()
    serializer_class = serializers.HWFQuestionSerializer


class HWFAnswerViewSet(viewsets.ModelViewSet):
    queryset = models.HWFAnswer.objects.all()
    serializer_class = serializers.HWFAnswerSerializer


class HWFReviewViewSet(viewsets.ModelViewSet):
    queryset = models.HWFReview.objects.all()
    serializer_class = serializers.HWFReviewSerializer
