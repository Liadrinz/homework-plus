# -*- coding: utf-8 -*-
import json
import graphene

from data import models, serializers
from data import encrypt
from data.graphql_schema.types import UserType
from data.graphql_schema.inputs import StudentImportInput

from data.graphql_schema.resp_msg import public_msg, create_msg

from data.proceeding import xl2json

class ImportStudentsFromExcel(graphene.Mutation):

    class Arguments:
        import_data = StudentImportInput(required=True)
    
    ok = graphene.Boolean()
    exist_users = graphene.List(of_type=UserType)
    cached_users = graphene.List(of_type=graphene.String)
    msg = graphene.String()

    def mutate(self, info, import_data):
        # id validation
        realuser = models.User.objects.filter(pk=info.context.META['realuser']).first()
        if realuser == None:
            return ImportStudentsFromExcel(ok=False, msg=public_msg['not_login'])
        
        editing_course = models.HWFCourseClass.objects.filter(pk=import_data['course_id']).first()
        
        # teacher assistant validation
        if not editing_course.teachers.filter(pk=realuser.pk) and not editing_course.teaching_assistants.filter(pk=realuser.pk):
            return ImportStudentsFromExcel(ok=False, msg=public_msg['forbidden'])

        students_e = []
        students_c = []

        excel_file = models.HWFFile.objects.filter(pk=import_data['excel_file']).first()
        students_bupt_id = xl2json.convert('./data/backend_media/' + str(excel_file.data))
        
        for bupt_id in students_bupt_id:
            target_user = models.User.objects.filter(bupt_id=bupt_id).first()
            if target_user:
                students_e.append(target_user)
            else:
                students_c.append(bupt_id)
        
        editing_course.cached_students_bupt_id = json.dumps(students_c)
        editing_course.save()
        
        return ImportStudentsFromExcel(ok=True, exist_users=students_e, cached_users=students_c, msg=public_msg['success'])
