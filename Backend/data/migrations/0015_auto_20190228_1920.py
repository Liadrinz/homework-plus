# Generated by Django 2.0.4 on 2019-02-28 19:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0014_auto_20190221_2018'),
    ]

    operations = [
        migrations.CreateModel(
            name='HostInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('host', models.CharField(max_length=32)),
                ('count', models.IntegerField()),
                ('start_time', models.DateTimeField(null=True)),
                ('is_locked', models.BooleanField(default=False)),
            ],
        ),
        migrations.AddField(
            model_name='hwfcourseclass',
            name='class_info',
            field=models.CharField(default='软件学院2017211501,2017211502,2017211503,2017211504', max_length=1024),
        ),
        migrations.AddField(
            model_name='hwfcourseclass',
            name='semester_info',
            field=models.CharField(default='2019春季学期', max_length=256),
        ),
    ]