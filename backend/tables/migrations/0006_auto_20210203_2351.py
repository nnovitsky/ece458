# Generated by Django 3.1.5 on 2021-02-03 23:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0005_auto_20210203_2341'),
    ]

    operations = [
        migrations.AlterField(
            model_name='instrument',
            name='comment',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AlterField(
            model_name='itemmodel',
            name='comment',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AlterField(
            model_name='itemmodel',
            name='description',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]