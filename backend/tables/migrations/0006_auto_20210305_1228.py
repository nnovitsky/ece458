# Generated by Django 3.1.6 on 2021-03-05 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0005_calibrationmode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calibrationmode',
            name='name',
            field=models.CharField(max_length=30, unique=True),
        ),
    ]
