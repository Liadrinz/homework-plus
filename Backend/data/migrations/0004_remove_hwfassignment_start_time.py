# Generated by Django 2.0.4 on 2019-02-02 08:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0003_auto_20190202_1611'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hwfassignment',
            name='start_time',
        ),
    ]
