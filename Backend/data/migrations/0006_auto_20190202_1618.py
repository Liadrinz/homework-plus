# Generated by Django 2.0.4 on 2019-02-02 08:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0005_hwfassignment_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hwfassignment',
            name='start_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]