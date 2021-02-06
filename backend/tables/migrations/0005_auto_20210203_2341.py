# Generated by Django 3.1.5 on 2021-02-03 23:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0004_calibrationevent_instrument'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=200),
        ),
        migrations.AlterUniqueTogether(
            name='instrument',
            unique_together={('model', 'serial_number')},
        ),
        migrations.AlterUniqueTogether(
            name='itemmodel',
            unique_together={('vendor', 'model_number')},
        ),
    ]
