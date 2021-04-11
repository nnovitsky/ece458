import datetime

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

from ..config.character_limits import *
from backend.config.admin_config import APPROVAL_STATUSES


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
    requires_approval = models.BooleanField(default=False)

    def __str__(self):
        return self.vendor + " " + self.model_number

    class Meta:
        unique_together = (("vendor", "model_number"),)


class Instrument(models.Model):
    """
    Instance of a model with unique model + serial number pair.
    """
    def default_asset_tag():
        used_asset_tags = Instrument.objects.values_list('asset_tag', flat=True)
        asset_tag = ASSET_TAG_MIN_VALUE
        while asset_tag in used_asset_tags:
            asset_tag += 1

        return asset_tag

    item_model = models.ForeignKey(ItemModel, on_delete=models.CASCADE)
    asset_tag = models.IntegerField(unique=True, default=default_asset_tag,
                                    validators=[MinValueValidator(ASSET_TAG_MIN_VALUE),
                                                MaxValueValidator(ASSET_TAG_MAX_VALUE)])
    serial_number = models.CharField(max_length=SERIAL_NUM_MAX_LENGTH, blank=True, null=True, default=None)
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)

    def __str__(self):
        return str(self.item_model) + " " + str(self.asset_tag)

    class Meta:
        unique_together = (("item_model", "serial_number"),)


class CalibrationEventFile(models.TextChoices):
    NONE = 'None'
    ARTIFACT = 'Artifact'
    LOAD_BANK = 'Load Bank'
    KLUFE = 'Klufe'


class CalibrationEvent(models.Model):
    """
    Calibration event for specific instrument.
    """
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    date = models.DateField(default=datetime.date.today)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)
    file_type = models.CharField(default=CalibrationEventFile.NONE, choices=CalibrationEventFile.choices,
                                 max_length=20)
    file = models.FileField(upload_to='cal_event_artifacts', null=True)
    approval_status = models.CharField(max_length=20, default=APPROVAL_STATUSES['no_approval'])

    def __str__(self):
        return str(self.instrument) + " " + str(self.date)


class CalibrationApproval(models.Model):
    """
    Approval details for CalibrationEvent.
    """
    cal_event = models.ForeignKey(CalibrationEvent, on_delete=models.CASCADE)
    approver = models.ForeignKey(User, on_delete=models.PROTECT)
    date = models.DateField(default=datetime.date.today)
    comment = models.CharField(max_length=COMMENT_MAX_LENGTH, blank=True)


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


class LoadBankCalibration(models.Model):
    """
    Details on load bank calibration event.
    """
    cal_event = models.ForeignKey(CalibrationEvent, on_delete=models.CASCADE)
    voltmeter_model_num = models.CharField(blank=True, null=True, max_length=MODEL_NUM_MAX_LENGTH)
    voltmeter_vendor = models.CharField(blank=True, null=True, max_length=VENDOR_MAX_LENGTH)
    voltmeter_asset_tag = models.IntegerField(blank=True, null=True) #models.ForeignKey(Instrument, on_delete=models.PROTECT, blank=True, null=True, related_name="lb_voltmeter")
    shunt_meter_model_num = models.CharField(blank=True, null=True, max_length=MODEL_NUM_MAX_LENGTH)
    shunt_meter_vendor = models.CharField(blank=True, null=True, max_length=VENDOR_MAX_LENGTH)
    shunt_meter_asset_tag = models.IntegerField(blank=True, null=True) #models.ForeignKey(Instrument, on_delete=models.PROTECT, blank=True, null=True, related_name="lb_shunt")
    visual_inspection = models.BooleanField(blank=True, default=False)
    auto_cutoff = models.BooleanField(blank=True, default=False)
    alarm = models.BooleanField(blank=True, default=False)
    recorded_data = models.BooleanField(blank=True, default=False)
    printer = models.BooleanField(blank=True, default=False)

    def __str__(self):
        return str(self.cal_event)


class LoadCurrent(models.Model):
    lb_cal = models.ForeignKey(LoadBankCalibration, on_delete=models.CASCADE)
    load = models.CharField(max_length=100)
    cr = models.FloatField()
    ca = models.FloatField()
    ideal = models.FloatField()
    cr_error = models.FloatField(null=True)
    ca_error = models.FloatField(null=True)
    index = models.IntegerField()
    cr_ok = models.BooleanField(default=False)
    ca_ok = models.BooleanField(default=False)

    def __str__(self):
        return str(self.lb_cal) + ' ' + str(self.load)

    class Meta:
        unique_together = (("lb_cal", "load"),)


class LoadVoltage(models.Model):
    lb_cal = models.OneToOneField(LoadBankCalibration, on_delete=models.CASCADE)
    vr = models.FloatField()
    va = models.FloatField()
    test_voltage = models.FloatField()
    vr_error = models.FloatField(null=True)
    va_error = models.FloatField(null=True)
    vr_ok = models.BooleanField(default=False)
    va_ok = models.BooleanField(default=False)

    def __str__(self):
        return str(self.lb_cal) + ' Voltage Test'


class CalibrationMode(models.Model):

    name = models.CharField(max_length=30, unique=True)
    models = models.ManyToManyField(ItemModel, blank=True)

    def __str__(self):
        return self.name


class KlufeCalibration(models.Model):
    cal_event = models.ForeignKey(CalibrationEvent, on_delete=models.CASCADE)
    completed_cal = models.BooleanField(default=False)

    def __str__(self):
        return str(self.cal_event) + ' Klufe Calibration'


class KlufeVoltageReading(models.Model):
    klufe_cal = models.ForeignKey(KlufeCalibration, on_delete=models.CASCADE)
    index = models.IntegerField()
    source_voltage = models.FloatField()
    source_hertz = models.FloatField(null=True)
    reported_voltage = models.FloatField(null=True)
    voltage_okay = models.BooleanField(default=False)

    def __str__(self):
        return str(self.klufe_cal) + f' Test {self.index}'


class CalibrationFormField(models.Model):
    itemmodel = models.ForeignKey(ItemModel, on_delete=models.CASCADE, null=True)
    cal_event = models.ForeignKey(CalibrationEvent, on_delete=models.CASCADE, null=True)
    index = models.IntegerField()
    fieldtype = models.CharField(max_length=20)
    label = models.CharField(max_length=LABEL_MAX_LENGTH, null=True)
    plaintext = models.CharField(max_length=PLAINTEXT_MAX_LENGTH, null=True)
    expected_string = models.CharField(max_length=TEXT_INPUT_MAX_LENGTH, null=True)
    expected_min = models.FloatField(null=True)
    expected_max = models.FloatField(null=True)
    actual_string = models.CharField(max_length=TEXT_INPUT_MAX_LENGTH, null=True, blank=True)
    actual_float = models.FloatField(null=True)
    actual_bool = models.BooleanField(null=True)
    value_okay = models.BooleanField(default=False)

    class Meta:
        unique_together = (("itemmodel", "index"),)
