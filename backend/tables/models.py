from django.db import models
from django.contrib.auth.models import User
import datetime

one_line = 100
two_line = 200


class ItemModel(models.Model):
    """
    Equipment model with unique vendor + model number pair.
    """
    vendor = models.CharField(max_length=one_line)
    model_number = models.CharField(max_length=one_line)
    description = models.CharField(max_length=two_line, blank=True)
    comment = models.CharField(max_length=two_line, blank=True)
    calibration_frequency = models.IntegerField(default=0)

    def __str__(self):
        return self.vendor + " " + self.model_number

    class Meta:
        unique_together = (("vendor", "model_number"),)


class Instrument(models.Model):
    """
    Instance of a model with unique model + serial number pair.
    """
    item_model = models.ForeignKey(ItemModel, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=one_line)
    comment = models.CharField(max_length=two_line, blank=True)

    def __str__(self):
        return str(self.item_model) + " " + self.serial_number

    class Meta:
        unique_together = (("item_model", "serial_number"),)


class CalibrationEvent(models.Model):
    """
    Calibration event for specific instrument.
    """
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    date = models.DateField(default=datetime.date.today)
    user = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.instrument) + " " + str(self.date)
