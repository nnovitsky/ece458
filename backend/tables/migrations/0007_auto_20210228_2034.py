# Generated by Django 3.1.6 on 2021-03-01 01:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0006_loadbankcalibration_loadcurrent'),
    ]

    operations = [
        migrations.AddField(
            model_name='loadcurrent',
            name='ca_ok',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='loadcurrent',
            name='cr_ok',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='loadcurrent',
            name='index',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='loadcurrent',
            name='ca_error',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='loadcurrent',
            name='cr_error',
            field=models.FloatField(null=True),
        ),
    ]