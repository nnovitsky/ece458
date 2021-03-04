import datetime

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

from ..config.character_limits import *


class UserType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    users = models.ManyToManyField(User, blank=True)

    @classmethod
    def contains_user(cls, user, type_name):
        try:
            group = UserType.objects.get(name=type_name)
        except UserType.DoesNotExist:
            return False
        return user in group.users.all()

    def __str__(self):
        return self.name


class ItemModel(models.Model):
    """
    Equipment model with unique vendor + model number pair.
    """
    vendor = models.CharField(max_length=VENDOR_MAX_LENGTH)
    model_number = models.CharField(max_length=MODEL_NUM_MAX_LENGTH)
    description = models.CharField(max_length=DESC_MAX_LENGTH)
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)
    calibration_frequency = models.IntegerField(default=0, validators=[MinValueValidator(0),
                                                                       MaxValueValidator(CAL_FREQUENCY_MAX_DURATION)])

    def __str__(self):
        return self.vendor + " " + self.model_number

    class Meta:
        unique_together = (("vendor", "model_number"),)


class Instrument(models.Model):
    """
    Instance of a model with unique model + serial number pair.
    """
    item_model = models.ForeignKey(ItemModel, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=SERIAL_NUM_MAX_LENGTH)
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)

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
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)
    file = models.FileField(upload_to='cal_event_artifacts', null=True)

    def __str__(self):
        return str(self.instrument) + " " + str(self.date)


class ItemModelCategory(models.Model):
    """
    Category for item models.
    """
    name = models.CharField(max_length=CATEGORY_NAME_MAX_LENGTH, unique=True)
    item_models = models.ManyToManyField(ItemModel, blank=True)

    def __str__(self):
        return self.name


class InstrumentCategory(models.Model):
    """
    Category for instruments.
    """
    name = models.CharField(max_length=CATEGORY_NAME_MAX_LENGTH, unique=True)
    instruments = models.ManyToManyField(Instrument, blank=True)

    def __str__(self):
        return self.name