from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from backend.tables.serializers import *
from backend.tables.models import ItemModel, Instrument
from backend.tables.filters import *
from backend.tables.utils import list_override


class ItemModelList(ListAPIView):
    queryset = ItemModel.objects.all()
    serializer_class = ItemModelSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = ItemModelFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request, "model_search")


class InstrumentList(ListAPIView):
    queryset = Instrument.objects.all()
    serializer_class = ListInstrumentReadSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = InstrumentFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request, "instrument_search")


class CalibrationEventList(ListAPIView):
    queryset = CalibrationEvent.objects.order_by('-date')
    serializer_class = SimpleCalibrationEventReadSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = CalibrationEventFilter

