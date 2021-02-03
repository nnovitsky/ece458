from django.contrib import admin

from backend.tables.models import ItemModel, User #, Instrument

admin.site.register(ItemModel)
admin.site.register(User)
#admin.site.register(Instrument)