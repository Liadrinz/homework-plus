# Generated by Django 2.0.4 on 2019-02-17 13:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0009_auto_20190214_1211'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hwfsubmission',
            name='addfile',
        ),
        migrations.RemoveField(
            model_name='hwfsubmission',
            name='image',
        ),
        migrations.AddField(
            model_name='hwfsubmission',
            name='zipped_file',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='zippped_file_submission', to='data.HWFFile'),
        ),
    ]
