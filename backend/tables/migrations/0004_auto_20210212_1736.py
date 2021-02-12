# Generated by Django 3.1.5 on 2021-02-12 17:36

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0003_auto_20210212_1728'),
    ]

    operations = [
        migrations.AlterField(
            model_name='itemmodel',
            name='calibration_frequency',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
