# -*- coding: utf-8 -*-
import base64
from itsdangerous import URLSafeTimedSerializer as utsr
from project.settings import SECRET_KEY


class Tokener():


    def __init__(self, security_key):
        self.security_key = security_key
        self.salt = base64.encodestring(security_key)


    def generate_validate_token(self, username):
        serializer = utsr(self.security_key)
        return serializer.dumps(username, self.salt)


    def confirm_validate_token(self, token, expiration=3600 * 24):
        serializer = utsr(self.security_key)
        return serializer.loads(token, salt=self.salt, max_age=expiration)


tokener = Tokener(SECRET_KEY.encode())