from django import http

forbidden_resp = http.HttpResponseForbidden('{"error": {"id": 1403 ,"msg": "forbidden"}}',content_type="application/json")
deadline_expired_resp = http.HttpResponseForbidden('{"error": {"id": 4001, "msg": "Deadline Expired"}}', content_type="application/json")
invalid_type_resp = http.HttpResponseBadRequest('{"error": {"id": 4002, "msg": "Invalid Type of Assignment"}}', content_type="application/json")
