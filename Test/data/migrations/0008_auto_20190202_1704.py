# Generated by Django 2.0.4 on 2019-02-02 09:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0007_hwfsubmission_long_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hwfassignment',
            name='addfile',
            field=models.ManyToManyField(blank=True, related_name='assignments', to='data.HWFFile'),
        ),
        migrations.AlterField(
            model_name='hwfcourseclass',
            name='students',
            field=models.ManyToManyField(blank=True, related_name='students_courses', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='hwfcourseclass',
            name='teachers',
            field=models.ManyToManyField(blank=True, related_name='teachers_courses', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='hwfcourseclass',
            name='teaching_assistants',
            field=models.ManyToManyField(blank=True, related_name='teaching_assistants_courses', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='addfile',
            field=models.ManyToManyField(blank=True, related_name='addfile_submissions', to='data.HWFFile'),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='assignment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignment_submissions', to='data.HWFAssignment'),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='image',
            field=models.ManyToManyField(blank=True, related_name='image_submissions', to='data.HWFFile'),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='long_picture',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='long_pic_submissions', to='data.HWFFile'),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='pdf',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pdf_submissions', to='data.HWFFile'),
        ),
        migrations.AlterField(
            model_name='hwfsubmission',
            name='submitter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='my_submissions', to=settings.AUTH_USER_MODEL),
        ),
    ]