# Generated by Django 3.1.6 on 2021-04-16 20:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0009_calibrationevent_calibrated_with'),
    ]

    operations = [
        migrations.RenameField(
            model_name='itemmodelcategory',
            old_name='calibrated_with',
            new_name='calibrated_by_instruments',
        ),
    ]