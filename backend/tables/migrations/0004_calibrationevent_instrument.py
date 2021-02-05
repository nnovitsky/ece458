# Generated by Django 3.1.5 on 2021-02-03 22:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tables', '0003_auto_20210203_1807'),
    ]

    operations = [
        migrations.CreateModel(
            name='Instrument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('serial_number', models.CharField(max_length=100)),
                ('comment', models.CharField(max_length=200)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.itemmodel')),
            ],
        ),
        migrations.CreateModel(
            name='CalibrationEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('instrument', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tables.instrument')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tables.user')),
            ],
        ),
    ]
