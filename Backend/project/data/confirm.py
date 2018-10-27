# -*- coding: utf-8 -*-
import base64
import re

from django.core.mail import send_mail
from itsdangerous import URLSafeTimedSerializer as utsr

import project.settings as settings
from project.settings import SECRET_KEY, FRONTEND_DOMAIN

# 10分钟过期的token
class ShortToken():
    def __init__(self, security_key):
        self.security_key = security_key
        self.salt = base64.encodestring(security_key)

    def generate_validate_token(self, username):
        serializer = utsr(self.security_key)
        return serializer.dumps(username, self.salt)

    def confirm_validate_token(self, token, expiration=6000):
        serializer = utsr(self.security_key)
        return serializer.loads(token, salt=self.salt, max_age=expiration)

# 24小时过期的token
class Token():
    def __init__(self, security_key):
        self.security_key = security_key
        self.salt = base64.encodestring(security_key)

    def generate_validate_token(self, username):
        serializer = utsr(self.security_key)
        return serializer.dumps(username, self.salt)

    def confirm_validate_token(self, token, expiration=3600*24):
        serializer = utsr(self.security_key)
        return serializer.loads(token, salt=self.salt, max_age=expiration)

# 注册邮件(url暂未定)
def send(user):
    global FRONTEND_DOMAIN
    token_confirm = ShortToken(SECRET_KEY.encode())
    token = token_confirm.generate_validate_token(user.username)
    message = "\n".join(['%s, 欢迎来到Homework+' % user.username,
                         '点击下面的链接来激活你的账号: ',
                         "http://" +
                         '/'.join([FRONTEND_DOMAIN, 'emailcheck', '?token='+str(token)])
                         ])
    send_mail('HomeworkPlus', message, 'liadrinz@163.com', [user.email])

# 忘记密码邮件(url暂未定)
def send_forget(user):
    global FRONTEND_DOMAIN
    token_confirm = ShortToken(SECRET_KEY.encode())
    token = token_confirm.generate_validate_token(user.username)
    message = "\n".join(['%s您好!' % user.username, '您忘记了密码, 请点击下面的链接来找回您的密码: ',
                         'http://'+'/'.join([FRONTEND_DOMAIN, 'forgetpassword', '?token='+str(token)])])
    send_mail('HomeworkPlus', message, 'liadrinz@163.com', [user.email])
