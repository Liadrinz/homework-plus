# -*- coding: utf-8 -*-
from graphene_django.types import DjangoObjectType
from data import models

# hidden fields
_user_exclude_fields = ('password', 'is_staff', 'is_superuser', 'first_name', 'last_name')
class UserAvatarType(DjangoObjectType):
    class Meta:
        model = models.UserAvatar


class FileType(DjangoObjectType):
    class Meta:
        model = models.HWFFile
        

class UserType(DjangoObjectType):
    class Meta:
        model = models.User
        exclude_fields = _user_exclude_fields


class CachedUserType(DjangoObjectType):
    class Meta:
        model = models.CachedUser


class TeacherType(DjangoObjectType):
    class Meta:
        model = models.User
        exclude_fields = _user_exclude_fields


class TeachingAssistantType(DjangoObjectType):
    class Meta:
        model = models.User
        exclude_fields = _user_exclude_fields


class StudentType(DjangoObjectType):
    class Meta:
        model = models.User
        exclude_fields = _user_exclude_fields


class CourseType(DjangoObjectType):
    class Meta:
        model = models.HWFCourseClass


class AssignmentType(DjangoObjectType):
    class Meta:
        model = models.HWFAssignment


class SubmissionType(DjangoObjectType):
    class Meta:
        model = models.HWFSubmission


class TotalMarksType(DjangoObjectType):
    class Meta:
        model = models.TotalMarks


class MessageFileType(DjangoObjectType):
    class Meta:
        model = models.MessageFile


class MessageContentType(DjangoObjectType):
    class Meta:
        model = models.MessageContent


class MessageType(DjangoObjectType):
    class Meta:
        model = models.Message
