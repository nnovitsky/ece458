# Generated by Django 3.1.7 on 2021-03-06 02:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='loadbankcalibration',
            name='shunt_meter',
        ),
        migrations.RemoveField(
            model_name='loadbankcalibration',
            name='voltmeter',
        ),
        migrations.AddField(
            model_name='calibrationevent',
            name='file_type',
            field=models.CharField(choices=[('None', 'None'), ('Artifact', 'Artifact'), ('Load Bank', 'Load Bank')], default='None', max_length=20),
        ),
        migrations.AddField(
            model_name='loadbankcalibration',
            name='shunt_meter_asset_tag',
            field=models.IntegerField(blank=True, null=True),
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
            name='voltmeter_asset_tag',
            field=models.IntegerField(blank=True, null=True),
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
        migrations.AlterField(
            model_name='instrument',
            name='serial_number',
            field=models.CharField(blank=True, default=None, max_length=40, null=True),
        ),
        migrations.CreateModel(
            name='CalibrationMode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30, unique=True)),
                ('models', models.ManyToManyField(blank=True, to='tables.ItemModel')),
            ],
        ),
    ]
