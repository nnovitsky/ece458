# Generated by Django 3.1.6 on 2021-04-16 19:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0008_auto_20210413_0954'),
    ]

    operations = [
        migrations.AddField(
            model_name='calibrationevent',
            name='calibrated_with',
            field=models.ManyToManyField(blank=True, related_name='instruments_used_set', to='tables.Instrument'),
        ),
    ]
