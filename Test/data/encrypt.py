# -*- coding: utf-8 -*-
# 加密
import hashlib
import random

# 把微信的openid加密一下

def getHash(s):
    for i in range(0, 5):
        hs = hashlib.md5()
        hs.update(s.encode('utf-8'))
        s = hs.hexdigest()
    return s