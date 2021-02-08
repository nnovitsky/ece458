from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from backend.tables.serializers import *
from backend.tables.models import ItemModel, Instrument
from backend.tables.filters import *


class ItemModelList(ListAPIView):
    queryset = ItemModel.objects.all()
    serializer_class = ItemModelSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = ItemModelFilter


class InstrumentList(ListAPIView):
    queryset = Instrument.objects.all()
    serializer_class = ListInstrumentReadSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = InstrumentFilter


class CalibrationEventList(ListAPIView):
    queryset = CalibrationEvent.objects.order_by('-date')
    serializer_class = SimpleCalibrationEventReadSerializer
    filter_backends = (DjangoFilterBackend, )
    filter_class = CalibrationEventFilter

