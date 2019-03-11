import requests
from data.models import JwxtCookieInfo
from bs4 import BeautifulSoup
import json

# get response cookie
def get_cookie():
    return json.loads(JwxtCookieInfo.objects.get(url="http://jwxt.bupt.edu.cn/").cookie)

# retrieve and save validation code
def get_valid_code():
    res_valid = requests.get("http://jwxt.bupt.edu.cn/validateCodeAction.do?random=", cookies=get_cookie())
    return res_valid.content

def login_jwxt(username, password, valid):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'jwxt.bupt.edu.cn',
        'Origin': 'http://jwxt.bupt.edu.cn',
        'Referer': 'http://jwxt.bupt.edu.cn/'
    }
    data = {
        'zjh': username,
        'mm': password,
        'v_yzm': valid,
        'type': 'sso'
    }
    requests.post(
        url='http://jwxt.bupt.edu.cn/jwLoginAction.do',
        data=data,
        headers=headers,
        cookies=get_cookie()
    )

from data.views import jwxt_clear_cookie, jwxt_update_cookie

def get_info():
    res = requests.get(
        url='http://jwxt.bupt.edu.cn/xjInfoAction.do?oper=xjxx',
        headers={
            'Accept': 'text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-Hans-CN, zh-Hans; q=0.8, en-GB; q=0.7, en; q=0.5, fr-FR; q=0.3, fr; q=0.2',
            'Connection': 'Keep-Alive',
            'Host': 'jwxt.bupt.edu.cn',
            'Referer': 'http://jwxt.bupt.edu.cn/menu/s_menu.jsp',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
        },
        cookies=get_cookie()
    )
    jwxt_update_cookie()
    html = res.text.replace('\t', '').replace('\n', '').replace('\r', '')
    soup = BeautifulSoup(html, 'lxml')
    result = {}
    for tag in soup.find_all(attrs={'class': 'fieldName'}):
        if tag.string and tag.next_sibling.string:
            key = tag.string.replace(' ', '').replace('\xa0', '').replace(':', '')
            val = tag.next_sibling.string.replace(' ', '')
            if key and val:
                result[key] = val
    return result
