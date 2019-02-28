from rest_framework import serializers

from data import models
from data.models import User

from data.encrypt import getHash

# 序列器 ( REST 和 GraphQL 中都有用到 )

class UserSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(read_only=True, required=False)
    bupt_id = serializers.CharField(required=False)
    class_number = serializers.CharField(required=False)
    is_active = serializers.BooleanField(read_only=True, required=False)
    date_joined = serializers.DateTimeField(read_only=True, required=False)
    wechat = serializers.CharField(required=False)

    def create(self, validated_data):
        vd = validated_data
        print(vd)
        username, password, email, phone, name, usertype, gender = vd['username'], vd[
            'password'], vd['email'], vd['phone'], vd['name'], vd['usertype'], vd['gender']
        user = None
        try:
            bupt_id = vd['bupt_id']
            class_number = vd['class_number']
            user = User.objects.create(usertype=usertype, gender=gender, username=username, email=email,
                                       bupt_id=bupt_id, phone=phone, class_number=class_number, name=name, is_active=False)
        except KeyError:
            user = User.objects.create(usertype=usertype, gender=gender, username=username, email=email,
                                       phone=phone, class_number="000", name=name, is_active=False)

        user.set_password(password)
        user.save()
        return user

    class Meta:
        model = User
        fields = ('id', 'is_active', 'date_joined', 'username', 'name', 'gender', 'useravatar',
                  'usertype', 'password', 'bupt_id', 'class_number', 'email', 'phone', 'wechat')


class UserSerializerCourse(UserSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'students_course',
                  'teachers_course', 'teaching_assistants_course')
        read_only_fields = ('id', 'username')


class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserAvatar
        fields = '__all__'

class HWFCourseClassSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False)
    class Meta:
        model = models.HWFCourseClass
        fields = '__all__'

class HWFAssignmentSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False)
    class Meta:
        model = models.HWFAssignment
        fields = '__all__'

# class HWFCourseClassSerializerWithAssignments(serializers.ModelSerializer):
    
#     class Meta:
#         model = models.HWFCourseClass
#         fields = ('id','name', 'description', 'course_assignments')


class HWFFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.HWFFile
        fields = '__all__'
        read_only_fields = ('initial_upload_time', 'initial_upload_user')


class HWFSubmissionSerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(required=False)
    addfile_id = serializers.IntegerField(required=False)
    submitter_id = serializers.IntegerField(required=False)
    score = serializers.FloatField(required=False)
    description = serializers.CharField(required=False)
    is_excellent = serializers.BooleanField(required=False)
    class Meta:
        model = models.HWFSubmission
        fields = '__all__'
        read_only_fields = ('submit_time', )
