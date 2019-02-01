# Register your models here.

from django.contrib import admin
from data.models import User
from data import models

admin.site.register(User)
admin.site.register(models.HWFCourseClass)
admin.site.register(models.HWFAssignment)
admin.site.register(models.HWFSubmission)
admin.site.register(models.HWFFile)
# admin.site.register(models.HWFMessage)
