from django.contrib import admin

from backend.tables.models import ItemModel, User , Instrument, CalibrationEvent

admin.site.register(ItemModel)
admin.site.register(User)
admin.site.register(Instrument)
admin.site.register(CalibrationEvent)