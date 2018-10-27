# Register your models here.

from django.contrib import admin
from data.models import User
from data import models

admin.site.register(User)
admin.site.register(models.HWFCourseClass)
admin.site.register(models.HWFAssignment)
admin.site.register(models.HWFQuestion)
admin.site.register(models.HWFSubmission)
admin.site.register(models.HWFAnswer)
admin.site.register(models.HWFTextAnswer)
admin.site.register(models.HWFSelectAnswer)
admin.site.register(models.HWFSelectAnswerValue)
admin.site.register(models.HWFSelectQuestionChoice)
admin.site.register(models.HWFSelectQuestion)
admin.site.register(models.HWFFile)
admin.site.register(models.HWFFileAnswer)
admin.site.register(models.HWFFileAnswerValue)
admin.site.register(models.HWFFileQuestion)
admin.site.register(models.HWFReview)
admin.site.register(models.HWFReviewTag)
# admin.site.register(models.HWFMessage)