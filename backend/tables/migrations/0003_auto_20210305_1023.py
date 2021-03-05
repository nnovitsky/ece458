# Generated by Django 3.1.6 on 2021-03-05 15:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0002_auto_20210305_1020'),
    ]

    operations = [
        migrations.RenameField(
            model_name='loadbankcalibration',
            old_name='shunt_meter',
            new_name='shunt_meter_asset_tag',
        ),
        migrations.RenameField(
            model_name='loadbankcalibration',
            old_name='voltmeter',
            new_name='voltmeter_asset_tag',
        ),
        migrations.AddField(
            model_name='loadbankcalibration',
            name='shunt_meter_model_num',
            field=models.CharField(blank=True, max_length=40, null=True),
        ),
        migrations.AddField(
            model_name='loadbankcalibration',
            name='shunt_meter_vendor',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='loadbankcalibration',
            name='voltmeter_model_num',
            field=models.CharField(blank=True, max_length=40, null=True),
        ),
        migrations.AddField(
            model_name='loadbankcalibration',
            name='voltmeter_vendor',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
