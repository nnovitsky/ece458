from django.contrib import admin
from backend.tables.models import ItemModel, Instrument, CalibrationEvent


admin.site.register(ItemModel)
admin.site.register(Instrument)
admin.site.register(CalibrationEvent)
