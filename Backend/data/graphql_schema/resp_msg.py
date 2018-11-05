# -*- coding: utf-8 -*-

public_msg = {
    "success": {"id": 1000, "msg": "ok"},
    "badreq": {"id": 1001, "msg": "bad request"},
    "not_login": {"id": 4001, "msg": "未登录"},
    "forbidden": {"id": 4002, "msg": "没有操作权限"}
}

def create_msg(id, msg):
    return {"id": id, "msg": msg}