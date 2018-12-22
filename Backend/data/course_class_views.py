# 暂时保留

import qrcode
from rest_framework import filters, generics, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from data import models, serializers
from data.safe import permissions
from data.safe.tokener import tokener as token
from project.settings import BACKEND_DOMIAN, FRONTEND_DOMAIN

# RESTful API for HWFCourseClass


class HWFCourseClassListView(generics.ListCreateAPIView):

    queryset = models.HWFCourseClass.objects.all()
    serializer_class = serializers.HWFCourseClassSerializer
    permission_classes = (
        permissions.SelfEditTeacherAppendUserReadForHWFCourseClass,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'description')
    

    def perform_create(self, serializer):
        user_token = self.request.META['HTTP_TOKEN']
        realuser = models.User.objects.get(username=token.confirm_validate_token(user_token))
        serializer.save(teachers=[realuser])


class HWFCourseClassDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = models.HWFCourseClass.objects.all()
    serializer_class = serializers.HWFCourseClassSerializer
    permission_classes = (
        permissions.SelfEditTeacherAppendUserReadForHWFCourseClass,)
    

    def get_object(self):
        token = self.request.GET.get('token', None)
        try:
            token.confirm_validate_token(token, expiration=600)
            return super().get_object()
        except:
            return
