# websocket routing
from django.conf.urls import url

from data import consumers

websocket_urlpatterns = [
    url(r'^ws/message/chat/$', consumers.ChatConsumer)
]