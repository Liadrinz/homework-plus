# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import MessageType
from data import models
from data.safe.tokener import tokener as token

Q = models.models.Q

class QueryMessage(object):

    get_messages_by_sender_and_receiver = graphene.List(MessageType, sender=graphene.Int(), receiver=graphene.Int())
    get_messages_by_receiver = graphene.List(MessageType, receiver=graphene.Int())

    
    def resolve_get_messages_by_sender_and_receiver(self, info, **kwargs):
        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()
        sender = kwargs['sender']
        receiver = kwargs['receiver']
        # 不能获取与自己无关的消息
        if realuser.pk != sender and realuser.pk != receiver:
            return
        # 获取两个用户之间相互的信息
        result = Q(sender=sender) & Q(receiver=receiver) | Q(sender=receiver) & Q(receiver=sender)
        return models.Message.objects.filter(result).order_by("send_time")

    def resolve_get_messages_by_receiver(self, info, **kwargs):
        realuser = models.User.objects.filter(pk=info.context.META.get('realuser', None)).first()
        receiver = kwargs['receiver']
        # 不能获取与自己无关的消息
        if realuser.pk != receiver:
            return
        return models.Message.objects.filter(receiver=receiver)