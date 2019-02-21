# -*- coding: utf-8 -*-
import graphene

# arguments of creating a user
class UserCreationInput(graphene.InputObjectType):
    username = graphene.String(required=True)
    name = graphene.String(required=True)
    gender = graphene.String(required=True)
    usertype = graphene.String(required=True)
    password = graphene.String(required=True)
    bupt_id = graphene.String(required=False)
    class_number = graphene.String(required=False)
    email = graphene.String(required=True)
    phone = graphene.String(required=True)


# arguments of editing a user
class UserEditionInput(graphene.InputObjectType):
    id = graphene.Int(required=True)
    username = graphene.String(required=False)
    class_number = graphene.String(required=False)
    phone = graphene.String(required=False)


# arguments of creating a course
class CourseCreationInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    description = graphene.String(required=True)
    marks = graphene.Float(required=True)
    teachers = graphene.List(of_type=graphene.Int, required=False)
    teaching_assistants = graphene.List(of_type=graphene.Int, required=False)
    students = graphene.List(of_type=graphene.Int, required=False)
    school = graphene.String(required=False)
    start_time = graphene.DateTime(required=True)
    end_time = graphene.DateTime(required=True)


# arguments of editing a course
class CourseEditionInput(graphene.InputObjectType):
    id = graphene.Int(required=True)
    name = graphene.String(required=False)
    description = graphene.String(required=False)
    marks = graphene.Float(required=False)
    teachers = graphene.List(of_type=graphene.Int, required=False)
    teaching_assistants = graphene.List(of_type=graphene.Int, required=False)
    students = graphene.List(of_type=graphene.Int, required=False)
    school = graphene.String(required=False)
    start_time = graphene.DateTime(required=False)
    end_time = graphene.DateTime(required=False)


# arguments of creating an Assignment
class AssignmentCreationInput(graphene.InputObjectType):
    course_class = graphene.Int(required=True)
    name = graphene.String(required=True)
    description = graphene.String(required=True)
    assignment_type = graphene.String(required=True)
    deadline = graphene.DateTime(required=True)
    addfile = graphene.List(of_type=graphene.Int, required=True)
    weight = graphene.Float(required=False)


# arguments of editing an Assignment
class AssignmentEditionInput(graphene.InputObjectType):
    id = graphene.Int(required=True)
    name = graphene.String(required=False)
    description = graphene.String(required=False)
    assignment_type = graphene.String(required=False)
    deadline = graphene.DateTime(required=False)
    addfile = graphene.List(of_type=graphene.Int, required=False)
    weight = graphene.Float(required=False)


# arguments of deleting an Assignment
class AssignmentDeletionInput(graphene.InputObjectType):
    ids = graphene.List(of_type=graphene.Int, required=True)


# arguments of creating a Submission
class SubmissionCreationInput(graphene.InputObjectType):
    image = graphene.List(of_type=graphene.Int, required=False)
    addfile = graphene.List(of_type=graphene.Int, required=False)
    assignment = graphene.Int(required=True)
    description = graphene.String(required=False)


# arguments of editing a Submission
class SubmissionEditionInput(graphene.InputObjectType):
    id = graphene.Int(required=True)
    image = graphene.List(of_type=graphene.Int, required=False)
    addfile = graphene.List(of_type=graphene.Int, required=False)
    description = graphene.String(required=False)


# arguments of giving score
class ScoreGivingInput(graphene.InputObjectType):
    submission = graphene.Int(required=True)
    score = graphene.Float(required=True)
    review_comment = graphene.String(required=False)
    is_excellent = graphene.Boolean(required=False)


# arguments of calculating total score
class TotalCalculationInput(graphene.InputObjectType):
    course = graphene.Int(required=True)
    student = graphene.Int(required=True)
