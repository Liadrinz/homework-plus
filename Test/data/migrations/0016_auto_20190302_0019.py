# Generated by Django 2.0.4 on 2019-03-02 00:19

import data.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0015_auto_20190228_1920'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(default=data.models.default_email, max_length=254, unique=True),
        ),
    ]