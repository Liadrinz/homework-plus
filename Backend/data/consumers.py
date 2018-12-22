# -*- coding: utf-8 -*-
# Websocket consumer
from asgiref.sync import async_to_sync
from data import models
from channels.generic.websocket import JsonWebsocketConsumer
import json

from data.user_views import token


def get_query_dict(query_string):
    query_string = query_string.decode('utf-8')
    queries = query_string.split('&')
    query_dict = {}
    for query in queries:
        key, val = query.split('=')
        query_dict[key] = val
    return query_dict


class ChatConsumer(JsonWebsocketConsumer):


    def connect(self):
        self.group_name = 'default'
        try:
            query_dict = get_query_dict(self.scope['query_string'])
        except Exception as e:
            # Bad Request
            self.close()
            return
        # 将两个用户的id排序后用下划线连接，作为组名
        self.sender_token = query_dict['sender']
        try:
            self.sender_id = str(token.confirm_validate_token(self.sender_token))
        except:
            # 未登录
            self.close()
            return
        self.receiver_id = query_dict['receiver']
        if self.sender_id == self.receiver_id:
            # 不能自己给自己发
            self.close()
            return
        self.joined_user = [self.sender_id, self.receiver_id]
        self.joined_user.sort()
        self.group_name = '_'.join(self.joined_user)
        self.joined_user = [int(i) for i in self.joined_user]
        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )
        print(self.group_name)
        self.accept()


    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    
    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        """
        message: {
            text: String,
            picture: Int,
            addfile: Int,
            audio: Int
        }
        """
        message = text_data_json.get('message', '')
        new_msg_content_obj = models.MessageContent.objects.create(**message)
        new_msg_obj = models.Message.objects.create(content=new_msg_content_obj, sender_id=self.sender_id, receiver_id=self.receiver_id)
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': {
                    'id': self.sender_id,
                    'username': models.User.objects.get(pk=self.sender_id).username
                },
                'receiver': {
                    'id': self.receiver_id,
                    'username': models.User.objects.get(pk=self.receiver_id).username
                },
                'send_time': str(new_msg_obj.send_time)
            }
        )
    

    def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        receiver = event['receiver']
        send_time = event['send_time']
        self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'receiver': receiver,
            'send_time': send_time
        }))
    

    def not_login(self, event):
        error = event['error']
        self.send(text_data=json.dumps({
            'error': error
        }))