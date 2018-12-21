# -*- coding: utf-8 -*-
from data import models
from data import encrypt
from data.user_views import token as tokener

def with_token(option):
    
    if option == 'info':

        def wrapper(func):
            
            def inner_wrapper(self, info, **kwargs):
                global tokener
                try:
                    realuser = tokener.confirm_validate_token(info.context.META['HTTP_TOKEN'])
                    realuser = models.User.objects.get(pk=realuser)
                except:
                    try:
                        realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
                    except:
                        return
                kwargs['realuser'] = realuser
                func(self, info, **kwargs)

            return inner_wrapper
        
        return wrapper