# Generated by Django 2.0.4 on 2018-11-05 02:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0002_auto_20181105_1034'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hwfassignment',
            name='assignment_type',
            field=models.CharField(choices=[('image', 'image'), ('docs', 'docs'), ('vary', 'vary')], default='vary', max_length=20),
        ),
    ]