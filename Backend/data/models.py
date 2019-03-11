# -*- coding: utf-8 -*-
from django.contrib.auth.models import AbstractUser, Group
from django.db import models
from datetime import datetime

# 为老师自动生成buptid
def default_bupt_id():
    count = User.objects.all().count()
    return 'noBuptId' + str(count)

def default_phone():
    count = User.objects.all().count()
    return 'noPhone' + str(count)

def default_email():
    count = User.objects.all().count()
    return 'noEmail' + str(count)

def default_semester_code():
    start_year = 2018
    codes = ['1', '2', '3']
    count = Semester.objects.all().count()
    return str(start_year + count // 3) + codes[count % 3]

def default_semester_name():
    start_year = 2018
    seasons = ['春季', '暑假', '秋季']
    count = Semester.objects.all().count()
    return str(start_year + count // 3) + seasons[count % 3] + '学期'


class HostInfo(models.Model):
    host = models.CharField(max_length=32)
    count = models.IntegerField()
    start_time = models.DateTimeField(null=True)
    is_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.host


class JwxtCookieInfo(models.Model):
    cookie = models.TextField(null=True)
    url = models.CharField(max_length=256)

    def __str__(self):
        return self.cookie


# User Profile
class User(AbstractUser):
    date_joined = models.DateTimeField(auto_now_add=True, null=True)
    bupt_id = models.CharField(
        max_length=10, unique=True, default=default_bupt_id)
    name = models.TextField(default='')
    email = models.EmailField(unique=True, default=default_email)
    phone = models.CharField(max_length=11, unique=True, default=default_phone)
    gender = models.CharField(
        max_length=6,
        choices=[(item, item) for item in ['male', 'female']],
        default='male')
    usertype = models.CharField(
        max_length=20,
        choices=[(item, item) for item in ['student', 'teacher', 'assistant']],
        default='student')
    class_number = models.CharField(max_length=10, default='noClass')
    wechat = models.TextField(null=True)
    forgotten = models.BooleanField(default=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_users')

    def __str__(self):
        return self.username


# 头像
class UserAvatar(models.Model):
    user = models.ManyToManyField(User, related_name='useravatar')
    url_height = models.PositiveIntegerField(default=75)
    url_width = models.PositiveIntegerField(default=75)
    useravatar = models.ImageField(
        upload_to="avatars",
        height_field='url_height',
        width_field='url_width',
        null=True)
    

class Semester(models.Model):
    semester_code = models.CharField(max_length=10, unique=True, default=default_semester_code)
    semester_name = models.CharField(max_length=100, unique=True, default=default_semester_name)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)

    def __str__(self):
        return self.semester_name


# 课程
class HWFCourseClass(models.Model):
    name = models.TextField()  # 可从excel导入
    semester = models.ForeignKey(Semester, on_delete=models.PROTECT, related_name='semester_classes')
    description = models.TextField(blank=True, null=True)
    marks = models.FloatField(default=0.0)
    teachers = models.ManyToManyField(
        User, related_name='teachers_courses', blank=True)
    teaching_assistants = models.ManyToManyField(
        User, related_name='teaching_assistants_courses', blank=True)
    students = models.ManyToManyField(
        User, related_name='students_courses', blank=True)  # 可从excel导入
    school = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    class_info = models.TextField(default='[]')  # JSON String 自动计算
    course_serial = models.CharField(max_length=2048, null=True)  # 从excel导入
    
    def __str__(self):
        return self.semester.semester_name + '-' + self.name


class CachedUser(models.Model):
    bupt_id = models.CharField(
        max_length=10, unique=True, default=default_bupt_id)
    courses = models.ManyToManyField(HWFCourseClass, related_name='cached_users', blank=True)

    def __str__(self):
        return self.bupt_id

# Any uploaded file is a HWFFile
# unique by hashcode
class HWFFile(models.Model):
    data = models.FileField(upload_to='homework_file', null=True)
    # copyright user
    initial_upload_time = models.DateTimeField(auto_now_add=True)
    initial_upload_user = models.ForeignKey(User, on_delete=models.PROTECT)


# 一项作业
class HWFAssignment(models.Model):
    course_class = models.ForeignKey(
        HWFCourseClass,
        on_delete=models.CASCADE,
        related_name='course_assignments')
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    assignment_type = models.CharField(
        max_length=20,
        choices=[(item, item) for item in ['image', 'docs', 'vary']],
        default='vary')
    addfile = models.ManyToManyField(
        HWFFile, related_name='assignments', blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    # 作业所占权重
    weight = models.FloatField(default=0.0)

    def __str__(self):
        return self.course_class.name + '-' + self.name


# submission to an assignment
class HWFSubmission(models.Model):
    aware = models.BooleanField(default=True)
    # image = models.ManyToManyField(
    #     HWFFile, blank=True, related_name='image_submissions')
    pdf = models.ForeignKey(
        HWFFile,
        on_delete=models.CASCADE,
        related_name='pdf_submissions',
        null=True)
    long_picture = models.ForeignKey(
        HWFFile,
        on_delete=models.CASCADE,
        related_name='long_pic_submissions',
        null=True)
    zipped_file = models.ForeignKey(
        HWFFile,
        on_delete=models.CASCADE,
        related_name='zippped_file_submission',
        null=True)
    # addfile = models.ManyToManyField(
    #     HWFFile, blank=True, related_name='addfile_submissions')
    submit_time = models.DateTimeField(auto_now_add=True)
    assignment = models.ForeignKey(
        HWFAssignment,
        on_delete=models.CASCADE,
        related_name='assignment_submissions')
    submitter = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='my_submissions')
    description = models.TextField(blank=True, null=True)
    is_reviewed = models.BooleanField(default=False)
    score = models.FloatField(default=0.0)
    review_comment = models.TextField(blank=True, null=True)
    review_result_picture = models.ForeignKey(HWFFile, on_delete=models.CASCADE, related_name='file_submission', null=True)
    is_excellent = models.BooleanField(default=False)

    def __str__(self):
        return self.assignment.name + '-' + self.submitter.bupt_id





class TotalMarks(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_total_marks')
    course_class = models.ForeignKey(HWFCourseClass, on_delete=models.CASCADE, related_name='course_total_marks')
    average = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    def __str__(self):
        return self.student.name + '-' + self.course_class.name


class MessageFile(models.Model):
    data = models.FileField(upload_to='chat_file', null=True)
    initial_upload_time = models.DateTimeField(auto_now_add=True)
    initial_upload_user = models.ForeignKey(User, on_delete=models.PROTECT)


# 一条消息的组成
class MessageContent(models.Model):
    text = models.TextField(max_length=2000)
    addfile = models.ForeignKey(
        MessageFile,
        related_name="file_message_content",
        on_delete=models.CASCADE,
        null=True)
    picture = models.ForeignKey(
        MessageFile,
        related_name="pic_message_content",
        on_delete=models.CASCADE,
        null=True)
    audio = models.ForeignKey(
        MessageFile,
        related_name="audio_message_content",
        on_delete=models.CASCADE,
        null=True)


# message
class Message(models.Model):
    send_time = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="out_message")
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="in_message")
    read = models.BooleanField(default=False)
    content = models.ForeignKey(
        MessageContent,
        related_name="complete_message",
        on_delete=models.CASCADE)
