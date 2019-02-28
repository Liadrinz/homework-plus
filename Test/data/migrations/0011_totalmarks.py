# Generated by Django 2.0.4 on 2019-02-21 12:45

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0010_auto_20190217_2127'),
    ]

    operations = [
        migrations.CreateModel(
            name='TotalMarks',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_marks', models.FloatField(default=0.0)),
                ('course_class', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='couse_total_marks', to='data.HWFCourseClass')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_total_marks', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
