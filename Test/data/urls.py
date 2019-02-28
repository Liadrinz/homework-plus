# -*- coding: utf-8 -*-
from django.conf.urls import include, url
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from data import user_views, views, course_class_views
from project import settings

router = DefaultRouter()
router.register('avatars', user_views.UserAvatarViewset, 'avatar')
router.register('files', views.HWFFileViewSet, 'file')

# 常规
urlpatterns = [
    url(r'^data/', include(router.urls)),   # 路由 url root
    url(r'^login/$', user_views.login), # 登录
    url(r'^data/is_repeated/$', user_views.is_repeated),    # 查重
    url(r'^account/activate/$', user_views.activate),   # 激活
    url(r'^account/change_password/$', user_views.change_password), # 改密
    url(r'^account/forget_password/$', user_views.forget_password), # 忘密
    url(r'^account/confirm_forgotten/$', user_views.confirm_forgotten), # 确认忘记
    url(r'^account/change_directly/$', user_views.directly_change)  # 直接修改密码(危险)
]


urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT) # 静态资源

# 与微信端相关的接口
urlpatterns += [
    url(r'^data/get_qrcode/$',views.get_qrcode),    # 获取课程二维码
    url(r'^data/bind_wechat_qrcode/$',views.bind_wechat),    # 获取绑定微信的二维码
    url(r'^data/users/$', user_views.user_list),    # 用户列表
    url(r'^data/users/(?P<pk>[0-9]+)/$', user_views.user_detail),   # 用户
    url(r'^data/courses/$', course_class_views.HWFCourseClassListView.as_view()),   # 课程列表
    url(r'^data/courses/(?P<pk>[0-9]+)/$', course_class_views.HWFCourseClassDetailView.as_view()),  # 课程
]

# 文件上传接口
urlpatterns += [
    url(r'^upload_file/$', views.upload_file)
]