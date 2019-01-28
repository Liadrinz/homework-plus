# -*- coding: utf-8 -*-
from django.contrib.auth.models import AbstractUser
from django.db import models


# 为老师自动生成buptid
def default_bupt_id():
    count = User.objects.all().count()
    return 'noBuptId'+str(count)


def default_phone():
    count = User.objects.all().count()
    return 'noPhone'+str(count)


# User Profile
class User(AbstractUser):
    date_joined = models.DateTimeField(auto_now_add=True, null=True)
    bupt_id = models.CharField(
        max_length=10, unique=True, default=default_bupt_id)
    name = models.TextField(default='')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=11, unique=True, default=default_phone)
    gender = models.CharField(max_length=6, choices=[(
        item, item) for item in ['male', 'female']], default='male')
    usertype = models.CharField(max_length=20, choices=[(item, item) for item in [
                                'student', 'teacher', 'assistant']], default='student')
    class_number = models.CharField(max_length=10, default='noClass')
    wechat = models.TextField(null=True)
    forgotten = models.BooleanField(default=False)


# 头像
class UserAvatar(models.Model):
    user = models.ManyToManyField(User,related_name='useravatar')
    url_height = models.PositiveIntegerField(default=75)
    url_width = models.PositiveIntegerField(default=75)
    useravatar = models.ImageField(
        upload_to="avatars", height_field='url_height', width_field='url_width', null=True)


# 课程
class HWFCourseClass(models.Model):
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    marks = models.FloatField(default=0.0)
    teachers = models.ManyToManyField(
        User, related_name='teachers_course', blank=True
        )
    teaching_assistants = models.ManyToManyField(
        User, related_name='teaching_assistants_course', blank=True
        )
    students = models.ManyToManyField(
        User, related_name='students_course', blank=True
        )
    school = models.TextField(null=True,blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name


# Any uploaded file is a HWFFile
# unique by hashcode
class HWFFile(models.Model):
    data = models.FileField(upload_to='homework_file', null=True)
    # copyright user
    initial_upload_time = models.DateTimeField(auto_now_add=True)
    initial_upload_user = models.ForeignKey(
        User, on_delete=models.PROTECT)


# 一项作业
class HWFAssignment(models.Model):
    course_class = models.ForeignKey(HWFCourseClass, on_delete=models.CASCADE, related_name='course_assignments')
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    assignment_type = models.CharField(max_length=20, choices=[(item, item) for item in [
                                'image', 'docs', 'vary']], default='vary')
    addfile = models.ManyToManyField(HWFFile, related_name='assignment', blank=True)
    deadline = models.DateTimeField()
    # 作业所占权重
    weight = models.FloatField(default=0.0)

    def __str__(self):
        return self.name


# submission to an assignment
class HWFSubmission(models.Model):
    aware = models.BooleanField(default=True)
    image = models.ManyToManyField(HWFFile, blank=True, related_name='image_submission')
    pdf = models.ForeignKey(HWFFile, on_delete=models.CASCADE, related_name='pdf_submission', null=True)
    addfile = models.ManyToManyField(HWFFile, blank=True, related_name='addfile_submission')
    submit_time = models.DateTimeField(auto_now_add=True)
    assignment = models.ForeignKey(HWFAssignment, on_delete=models.CASCADE, related_name='assignment_submission')
    submitter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_submission')
    description = models.TextField(blank=True, null=True)
    score = models.FloatField(default=0.0)
    is_excellent = models.BooleanField(default=False)


class MessageFile(models.Model):
    data = models.FileField(upload_to='chat_file', null=True)
    initial_upload_time = models.DateTimeField(auto_now_add=True)
    initial_upload_user = models.ForeignKey(
        User, on_delete=models.PROTECT)
    

# 一条消息的组成
class MessageContent(models.Model):
    text = models.TextField(max_length=2000)
    addfile = models.ForeignKey(MessageFile, related_name="file_message_content", on_delete=models.CASCADE, null=True)
    picture = models.ForeignKey(MessageFile, related_name="pic_message_content", on_delete=models.CASCADE, null=True)
    audio = models.ForeignKey(MessageFile, related_name="audio_message_content", on_delete=models.CASCADE, null=True)


# message
class Message(models.Model):
    send_time = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="out_message")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="in_message")
    read = models.BooleanField(default=False)
    content = models.ForeignKey(MessageContent, related_name="complete_message", on_delete=models.CASCADE)


# 以下只建了表, 未做后续工作


class HWFQuestion(models.Model):
    assignment = models.ForeignKey(HWFAssignment, on_delete=models.PROTECT)
    auto_score = models.BooleanField(default=False)
    question_text = models.TextField()
    description = models.TextField()
    score = models.FloatField()


class HWFAnswer(models.Model):
    submission = models.ForeignKey(HWFSubmission, on_delete=models.PROTECT)
    reviewed = models.BooleanField(default=False)
    score = models.FloatField(default=0)
    question = models.ForeignKey(HWFQuestion, on_delete=models.PROTECT)


class HWFTextAnswer(HWFAnswer):
    values = models.TextField()


# pre generated static values
class HWFSelectAnswerValue(models.Model):
    value = models.IntegerField(unique=True)


class HWFSelectAnswer(HWFAnswer):
    values = models.ManyToManyField(HWFSelectAnswerValue)


class HWFFileAnswerValue(models.Model):
    description = models.TextField()
    value = models.ForeignKey(HWFFile, on_delete=models.PROTECT)


class HWFFileAnswer(HWFAnswer):
    values = models.ManyToManyField(HWFFileAnswerValue)


class HWFSelectQuestion(HWFQuestion):
    is_multiple_choices = models.BooleanField(default=False)
    correct_answer = models.ForeignKey(
        HWFSelectAnswer, on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        self._meta.get_field('auto_score').default = True
        super(HWFQuestion, self).__init__(*args, **kwargs)


class HWFSelectQuestionChoice(models.Model):
    question = models.ForeignKey(HWFSelectQuestion, on_delete=models.PROTECT)
    text = models.TextField()
    value = models.IntegerField()


class HWFFileQuestion(HWFQuestion):
    values = models.ManyToManyField(HWFFile)


# mark for great, good, poor
class HWFReviewTag(models.Model):
    value = models.IntegerField()
    name = models.TextField()


class HWFReview(models.Model):
    mark_review = models.ForeignKey(HWFReviewTag, on_delete=models.PROTECT)
    reviewer = models.ForeignKey(
        User, related_name='reviewer_review', on_delete=models.PROTECT)
    text = models.TextField()
    answer = models.ForeignKey(HWFAnswer, on_delete=models.PROTECT)
    is_graph_review = models.BooleanField(default=False)
    graph_value = models.TextField()
