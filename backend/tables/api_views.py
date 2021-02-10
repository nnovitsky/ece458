from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Max, F, DurationField, DateField, ExpressionWrapper, Case, When
from backend.tables.serializers import *
from backend.tables.models import ItemModel, Instrument
from backend.tables.filters import *
from backend.tables.utils import list_override


class ItemModelList(ListAPIView):
    queryset = ItemModel.objects.all()
    serializer_class = ItemModelSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = ItemModelFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request, "model_search")


class InstrumentList(ListAPIView):
    # annotate list with most recent calibration and calibration expiration date
    today = datetime.date.today()
    duration_expression = F('item_model__calibration_frequency') * 86400000000
    duration_wrapped_expression = ExpressionWrapper(duration_expression, DurationField())
    expiration_expression = F('most_recent_calibration') + F('cal_freq')
    queryset = Instrument.objects.annotate(most_recent_calibration=Max('calibrationevent__date')).annotate(
        cal_freq=duration_wrapped_expression).annotate(
        calibration_expiration_date=Case(When(item_model__calibration_frequency__lte=0, then=None),
                                         When(most_recent_calibration__isnull=False, then=expiration_expression),
                                         default=today,
                                         output_field=DateField(), ))

    serializer_class = ListInstrumentReadSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = InstrumentFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request, "instrument_search")


class CalibrationEventList(ListAPIView):
    queryset = CalibrationEvent.objects.order_by('-date')
    serializer_class = SimpleCalibrationEventReadSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = CalibrationEventFilter
