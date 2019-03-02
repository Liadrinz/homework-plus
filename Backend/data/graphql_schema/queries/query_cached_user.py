# -*- coding: utf-8 -*-
import graphene
from data.graphql_schema.types import *
from data import models
from data.proceeding import xl2json

class QueryCachedUser(object):

    all_cached_users = graphene.List(CachedUserType)

    def resolve_all_cached_users(self, info, **kwargws):
        return models.CachedUser.objects.all()
