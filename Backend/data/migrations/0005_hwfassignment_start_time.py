# Generated by Django 2.0.4 on 2019-02-02 08:17

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0004_remove_hwfassignment_start_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='hwfassignment',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2019, 1, 1, 0, 0)),
        ),
    ]