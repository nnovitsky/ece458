# Generated by Django 3.1.6 on 2021-02-06 15:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0008_auto_20210205_1938'),
    ]

    operations = [
        migrations.RenameField(
            model_name='instrument',
            old_name='model',
            new_name='item_model',
        ),
        migrations.AlterUniqueTogether(
            name='instrument',
            unique_together={('item_model', 'serial_number')},
        ),
    ]
