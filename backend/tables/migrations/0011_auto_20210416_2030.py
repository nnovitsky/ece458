# Generated by Django 3.1.6 on 2021-04-16 20:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0010_auto_20210416_2026'),
    ]

    operations = [
        migrations.RenameField(
            model_name='calibrationevent',
            old_name='calibrated_with',
            new_name='calibrated_by_instruments',
        ),
        migrations.RenameField(
            model_name='itemmodelcategory',
            old_name='calibrated_by_instruments',
            new_name='calibrated_with',
        ),
    ]
