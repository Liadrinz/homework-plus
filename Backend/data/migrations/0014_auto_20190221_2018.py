# Generated by Django 2.0.4 on 2019-02-21 20:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0013_auto_20190221_2011'),
    ]

    operations = [
        migrations.RenameField(
            model_name='totalmarks',
            old_name='direct_average',
            new_name='average',
        ),
        migrations.RemoveField(
            model_name='totalmarks',
            name='weighted_average',
        ),
    ]
