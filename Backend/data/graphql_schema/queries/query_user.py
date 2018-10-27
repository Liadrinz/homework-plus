import graphene
from data.graphql_schema.types import *
from data import models

class QueryUser(object):

    all_users = graphene.List(UserType)
    get_users_by_ids = graphene.List(UserType, ids=graphene.List(of_type=graphene.Int))
    get_users_by_usertype = graphene.List(UserType, usertype=graphene.String())
    get_users_by_usernames = graphene.List(UserType, usernames=graphene.List(of_type=graphene.String))
    get_users_by_course_id = graphene.List(UserType, course_id=graphene.Int())

    # query for users
    def resolve_all_users(self, info, **kwargs):
        return models.User.objects.all()
        
    def resolve_get_users_by_ids(self, info, **kwargs):
        result = models.models.Q(pk=None)
        for item in kwargs['ids']:
            result = result | models.models.Q(pk=item)
        return models.User.objects.filter(result)

    def resolve_get_users_by_usertype(self, info, **kwargs):
        return models.User.objects.filter(usertype=kwargs['usertype'])

    def resolve_get_users_by_usernames(self, info, **kwargs):
        result = models.models.Q(username=None)
        for item in kwargs['usernames']:
            result = result | models.models.Q(username=item)
        return models.User.objects.filter(result)

    def resolve_get_users_by_course_id(self, info, **kwargs):
        target_course = models.HWFCourseClass.objects.get(pk=kwargs['course_id'])
        return target_course.students.all()

