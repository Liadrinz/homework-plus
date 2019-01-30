# -*- coding: utf-8 -*-
from graphene_django.views import *
from django.http import HttpResponseForbidden
from data.safe.tokener import tokener as token
from data import encrypt
from data import models

from project import settings


# 重写GraphQLView
class BetterGraphQLView(GraphQLView):


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


    def dispatch(self, request, *args, **kwargs):
        if settings.DEBUG == True:
            return super().dispatch(request, *args, **kwargs)
        tk = request.META.get('HTTP_TOKEN','')
        try: 
            token.confirm_validate_token(tk)
            return super().dispatch(request, *args, **kwargs)
        except:
            try:
                hs = encrypt.getHash(tk)
                models.User.objects.get(wechat=hs)
                return super().dispatch(request, *args, **kwargs)
            except:
                return HttpResponseForbidden('{"error":"forbidden"}',content_type="application/json")

