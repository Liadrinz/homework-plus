from data.models import JwxtCookieInfo
import requests
import json

t_cookie = json.dumps(requests.get("http://jwxt.bupt.edu.cn/").cookies.get_dict())

res = JwxtCookieInfo.objects.filter(url="http://jwxt.bupt.edu.cn/").first()
if res:
    res.cookie = t_cookie
    res.save()
else:
    JwxtCookieInfo.objects.create(
        url="http://jwxt.bupt.edu.cn/",
        cookie=t_cookie
    )
