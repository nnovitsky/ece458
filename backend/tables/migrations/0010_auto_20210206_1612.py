# Generated by Django 3.1.6 on 2021-02-06 21:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0009_auto_20210206_1045'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='instrument',
            name='model_number',
        ),
        migrations.RemoveField(
            model_name='instrument',
            name='vendor',
        ),
    ]