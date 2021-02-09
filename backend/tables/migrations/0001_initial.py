# Generated by Django 3.1.5 on 2021-02-09 22:51

import datetime
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vendor', models.CharField(max_length=100)),
                ('model_number', models.CharField(max_length=100)),
                ('description', models.CharField(blank=True, max_length=200)),
                ('comment', models.CharField(blank=True, max_length=200)),
                ('calibration_frequency', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
            ],
            options={
                'unique_together': {('vendor', 'model_number')},
            },
        ),
        migrations.CreateModel(
            name='Instrument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('serial_number', models.CharField(max_length=100)),
                ('comment', models.CharField(blank=True, max_length=200)),
                ('item_model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.itemmodel')),
            ],
            options={
                'unique_together': {('item_model', 'serial_number')},
            },
        ),
        migrations.CreateModel(
            name='CalibrationEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(default=datetime.date.today)),
                ('comment', models.CharField(blank=True, max_length=200)),
                ('instrument', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.instrument')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
