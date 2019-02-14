# -*- coding: utf-8 -*-
# !!!!!!! Don't edit this file unless you're Liadrinz !!!!!!!
import graphene
import data.schema

class Query(
    data.schema.QueryMessage, 
    data.schema.QueryUser, 
    data.schema.QuerySubmission, 
    data.schema.QueryCourse, 
    data.schema.QueryAssignment, 
    graphene.ObjectType
    ):
    pass

class Mutations(graphene.ObjectType):
    give_score = data.schema.GiveScore.Field()
    edit_user = data.schema.EditUser.Field()
    edit_submission = data.schema.EditSubmission.Field()
    edit_course = data.schema.EditCourse.Field()
    edit_assignment = data.schema.EditAssignment.Field()
    delete_assignment = data.schema.DeleteAssignment.Field()
    create_user = data.schema.CreateUser.Field()
    create_submission = data.schema.CreateSubmission.Field()
    create_course = data.schema.CreateCourse.Field()
    create_assignment = data.schema.CreateAssignment.Field()
schema = graphene.Schema(query=Query, mutation=Mutations)
