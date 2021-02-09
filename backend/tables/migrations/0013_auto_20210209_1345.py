# Generated by Django 3.1.6 on 2021-02-09 18:45

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0012_calibrationevent_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='itemmodel',
            name='calibration_frequency',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]