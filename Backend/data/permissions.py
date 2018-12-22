# -*- coding: utf-8 -*-
# 暂时保留

import re

from itsdangerous import SignatureExpired
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from data.models import User
from data.user_views import token

from data import encrypt

# 对于REST的一些权限控制


# basic class
class SelfEditUserAppendUserRead(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            vtoken = request.META['HTTP_TOKEN']
            if token.confirm_validate_token(vtoken):
                return True
        except:
            openid = request.data['openid']
            hs = encrypt.getHash(openid)
            try:
                User.objects.get(wechat=hs)
                return True
            except:
                return False
        return False

# basic class


class SelfEditTeacherAppendUserRead(SelfEditUserAppendUserRead):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            vtoken = request.META['HTTP_TOKEN']
            if User.objects.get(username=token.confirm_validate_token(vtoken)).usertype == 'teacher':
                return True
        except:
            openid = request.data['openid']
            hs = encrypt.getHash(openid)
            try:
                if User.objects.get(wechat=hs).usertype == 'teacher':
                    return True
            except:
                return False
        return False

# derived


class SelfEditTeacherAppendUserReadForHWFCourseClass(SelfEditTeacherAppendUserRead):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        try:
            vtoken = request.META['HTTP_TOKEN']
            realuser = User.objects.get(username=token.confirm_validate_token(vtoken))
            teacher_list = obj.teachers
            if realuser.pk in teacher_list:
                return True
        except:
            openid = request.data['openid']
            hs = encrypt.getHash(openid)
            realuser = User.objects.get(wechat=hs)
            teacher_list = obj.teachers
            if realuser.pk in teacher_list:
                return True
        return False


class SelfEditUserReadForHWFCourseClass(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method != 'PUT':
            return False
        else:
            try:
                vtoken = request.META['HTTP_TOKEN']
                if token.confirm_validate_token(vtoken) == User.objects.get(username=obj.username).username:
                    return True
            except:
                openid = request.data['openid']
                hs = encrypt.getHash(openid)
                try:
                    if hs == User.objects.get(pk=obj.pk).wechat:
                        return True
                except:
                    return False
            return False