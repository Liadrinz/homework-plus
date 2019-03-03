# Register your models here.

from django.contrib import admin
from data import models

admin.site.register(models.HostInfo)
admin.site.register(models.JwxtCookieInfo)
admin.site.register(models.User)
admin.site.register(models.UserAvatar)
admin.site.register(models.Semester)
admin.site.register(models.HWFCourseClass)
admin.site.register(models.CachedUser)
admin.site.register(models.HWFFile)
admin.site.register(models.HWFAssignment)
admin.site.register(models.HWFSubmission)
admin.site.register(models.TotalMarks)
admin.site.register(models.MessageFile)
admin.site.register(models.MessageContent)
admin.site.register(models.Message)
