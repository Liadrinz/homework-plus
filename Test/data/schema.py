# -*- coding: utf-8 -*-

from data.graphql_schema.mutations.set_weight import SetWeights
from data.graphql_schema.mutations.import_students_from_excel import ImportStudentsFromExcel
from data.graphql_schema.mutations.give_score import GiveScore
from data.graphql_schema.mutations.edit_user import EditUser
from data.graphql_schema.mutations.edit_submission import EditSubmission
from data.graphql_schema.mutations.edit_course import EditCourse
from data.graphql_schema.mutations.edit_assignment import EditAssignment
from data.graphql_schema.mutations.delete_assignment import DeleteAssignment
from data.graphql_schema.mutations.create_user_from_jwxt import CreateUserFromJwxt
from data.graphql_schema.mutations.create_user import CreateUser
from data.graphql_schema.mutations.create_submission import CreateSubmission
from data.graphql_schema.mutations.create_course import CreateCourse
from data.graphql_schema.mutations.create_assignment import CreateAssignment
from data.graphql_schema.mutations.calculate_total import CalculateTotal
from data.graphql_schema.queries.query_user import QueryUser
from data.graphql_schema.queries.query_total_marks import QueryTotalMarks
from data.graphql_schema.queries.query_submission import QuerySubmission
from data.graphql_schema.queries.query_message import QueryMessage
from data.graphql_schema.queries.query_course import QueryCourse
from data.graphql_schema.queries.query_cached_user import QueryCachedUser
from data.graphql_schema.queries.query_assignment import QueryAssignment
