from django.db import models

one_line = 100
two_line = 200


# class User(models.Model):
#     email = models.CharField(max_length=one_line)
#     username = models.CharField(max_length=one_line)
#     first_name = models.CharField(max_length=one_line)
#     last_name = models.CharField(max_length=one_line)
#     password = models.CharField(max_length=50) #forms.CharField(widget=forms.PasswordInput)
#     #isAdmin = models.BooleanField()


class ItemModel(models.Model):
    vendor = models.CharField(max_length=one_line)
    model_number = models.CharField(max_length=one_line)
    description = models.CharField(max_length=two_line)
    comment = models.CharField(max_length=two_line)
    calibration_frequency = models.IntegerField(default=0)

    def __str__(self):
        return self.vendor + " " + self.model_number

    def isCalibratable(self):
        return self.calibration_frequency > 0


# class Instrument(models.Model):
#     model = models.ForeignKey(ItemModel, on_delete=models.CASCADE)
#     serial_number = models.CharField(max_length=one_line)
#     comment = models.CharField(max_length=two_line)
#     #most_recent_calibration = models.ForeignKey(CalibrationEvent)
#
#     def __str__(self):
#         return self.model + " " + self.serial_number
#
#     #def isCalibrated(self):
#         #return days_since_calibrated < calibration_frequency
#
# class CalibrationEvent(models.Model):
#     instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
#     date = models.DateField()
#     user = models.ForeignKey(User, on_delete=models.PROTECT)
