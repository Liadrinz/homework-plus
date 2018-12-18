# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import MessageType
from data import models
from data.models import models

Q = models.Q

class QueryMessage(object):

    get_messages_by_sender_and_receiver = graphene.List(MessageType, sender=graphene.Int(), receiver=graphene.Int())

    def resolve_get_messages_by_sender_and_receiver(self, info, **kwargs):
        sender = kwargs['sender']
        receiver = kwargs['receiver']
        # 获取两个用户之间相互的信息
        result = Q(sender=sender) & Q(receiver=receiver) | Q(sender=receiver) & Q(receiver=sender)
        return models.Message.objects.filter(result)