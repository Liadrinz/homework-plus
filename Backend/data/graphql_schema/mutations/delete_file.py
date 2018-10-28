import graphene
from django import http

import os

from data import models
from data.user_views import token
from data import encrypt
from data.graphql_schema.types import FileType

from data.graphql_schema import except_resp as Exresp

# deleting a HWFFile
class DeleteFile(graphene.Mutation):

    class Arguments:
        file_ids = graphene.List(graphene.Int,required=True)
    
    ok = graphene.Boolean()

    def mutate(self, info, file_ids):

        # id validation
        try:
            realuser = models.User.objects.get(wechat=encrypt.getHash(info.context.META['HTTP_TOKEN']))
        except:
            return DeleteFile(ok=False)

        for id in file_ids:
            obj_to_del = models.HWFFile.objects.get(pk=id)
            local_path = obj_to_del.data
            os.system("rm ./data/backend_media/" + local_path)
            obj_to_del.delete()
            return DeleteFile(ok=True)

        