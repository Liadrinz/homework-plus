from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import HttpResponse
from data.safe.tokener import tokener as token
from data import encrypt
from data import models
import datetime
import threading
import os

from data.user_views import login, user_list
from data.views import upload_file
from project.urls import gql_view_func

class Verification(MiddlewareMixin):
    def process_request(self, request):
        tk = request.META.get('HTTP_TOKEN', '')
        req_user_pk = None
        try:
            req_user_pk = token.confirm_validate_token(tk)
            request.META['is_wechat'] = False
        except:
            try:
                req_user_pk = models.User.objects.get(wechat=encrypt.getHash(tk))
                request.META['is_wechat'] = True
            except:
                pass
        request.META['realuser'] = req_user_pk
        return None
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        if view_func == login or view_func == user_list:
            return None
        elif request.META.get('realuser', None):
            return None
        else:
            return HttpResponse('forbidden')
            


class FrequencyLimit(MiddlewareMixin):
    def process_request(self, request):
        """
        单个IP两分钟内不得超过5000个请求
        """
        try:
            host = request.META.get('REMOTE_ADDR')
            info = models.HostInfo.objects.filter(host=host).first()
            duration = 0
            if info:
                duration = (datetime.datetime.now() - info.start_time).seconds
                if duration < 120 and info.is_locked == False:
                    info.count += 1
                    info.save()
                else:
                    if info.is_locked == False or duration > 180:
                        info.count /= (duration / 60)
                    else:
                        info.count = (info.count + 1) * 1.1
                    info.start_time = datetime.datetime.now()
                    info.save()
            else:
                info = models.HostInfo.objects.create(host=host, start_time=datetime.datetime.now(), count=1)
            if info.count >= 5000:
                info.is_locked = True
                info.save()
                return HttpResponse("Blocked")
            else:
                info.is_locked = False
                info.save()
                return None
        except:
            return HttpResponse("blocked")
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        每人每天上传不超过1GB文件
        """
        if view_func != upload_file:
            return None
        owners_files = models.HWFFile.objects.filter(models.models.Q(initial_upload_user_id=request.META.get('realuser', None)))
        size = 0
        for owners_file in owners_files:
            tf = owners_file.initial_upload_time.replace(tzinfo=None)
            tn = datetime.datetime.now()
            if [tf.year, tf.month, tf.day] == [tn.year, tn.month, tn.day]:
                try:
                    size += os.path.getsize('./data/backend_media/' + owners_file.data)
                except FileNotFoundError:
                    pass
        if size <= 2 ** 30:
            return None
        else:
            return HttpResponse("blocked")