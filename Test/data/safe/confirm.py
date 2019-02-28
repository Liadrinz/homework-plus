# -*- coding: utf-8 -*-
from django.core.mail import send_mail
from project import settings
from project.settings import FRONTEND_DOMAIN
from data.safe.tokener import tokener


def send_confirm(user_obj):
    global FRONTEND_DOMAIN
    tokener.generate_validate_token(user_obj.username)
    message = "\n".join(['%s, 欢迎来到Homework+' % user.username,
                         '点击下面的链接来激活你的账号: ',
                         "http://" +
                         '/'.join([FRONTEND_DOMAIN, 'emailcheck', '?token='+str(token)])
                         ])
    send_mail('HomeworkPlus', message, 'liadrinz@163.com', [user.email])


def send_forget(user_obj):
    global FRONTEND_DOMAIN
    tokener.generate_validate_token(user_obj.username)
    message = "\n".join(['%s您好!' % user.username, '您忘记了密码, 请点击下面的链接来找回您的密码: ',
                         'http://'+'/'.join([FRONTEND_DOMAIN, 'forgetpassword', '?token='+str(token)])])
    send_mail('HomeworkPlus', message, 'liadrinz@163.com', [user.email])
