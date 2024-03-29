# Generated by Django 3.1.6 on 2021-03-25 18:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0002_auto_20210306_0211'),
    ]

    operations = [
        migrations.CreateModel(
            name='KlufeCalibration',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('completed_cal', models.BooleanField(default=False)),
            ],
        ),
        migrations.AlterField(
            model_name='calibrationevent',
            name='file_type',
            field=models.CharField(choices=[('None', 'None'), ('Artifact', 'Artifact'), ('Load Bank', 'Load Bank'), ('Klufe', 'Klufe')], default='None', max_length=20),
        ),
        migrations.CreateModel(
            name='KlufeVoltageReading',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.IntegerField()),
                ('source_voltage', models.FloatField()),
                ('source_hertz', models.FloatField(null=True)),
                ('reported_voltage', models.FloatField(null=True)),
                ('voltage_okay', models.BooleanField(default=False)),
                ('klufe_cal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.klufecalibration')),
            ],
        ),
        migrations.AddField(
            model_name='klufecalibration',
            name='cal_event',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.calibrationevent'),
        ),
    ]
