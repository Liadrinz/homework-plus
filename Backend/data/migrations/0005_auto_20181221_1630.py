# Generated by Django 2.1.4 on 2018-12-21 08:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0004_auto_20181218_1704'),
    ]

    operations = [
        migrations.AlterField(
            model_name='messagecontent',
            name='audio',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='audio_message_content', to='data.MessageFile'),
        ),
    ]
