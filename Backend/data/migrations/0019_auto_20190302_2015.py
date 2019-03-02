# Generated by Django 2.0.4 on 2019-03-02 20:15

import data.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0018_auto_20190302_1524'),
    ]

    operations = [
        migrations.CreateModel(
            name='CachedUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bupt_id', models.CharField(default=data.models.default_bupt_id, max_length=10, unique=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='hwfcourseclass',
            name='cached_students_bupt_id',
        ),
        migrations.AddField(
            model_name='cacheduser',
            name='courses',
            field=models.ManyToManyField(blank=True, related_name='cached_users', to='data.HWFCourseClass'),
        ),
    ]