from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Max, F, DurationField, DateField, ExpressionWrapper, Case, When, Func
from django.utils import timezone
from backend.tables.serializers import *
from backend.tables.models import ItemModel, Instrument
from backend.tables.filters import *
from backend.tables.utils import list_override


class ItemModelList(ListAPIView):
    queryset = ItemModel.objects.all().annotate(vendor_lower=Func(F('vendor'), function='LOWER')).annotate(
        model_number_lower=Func(F('model_number'), function='LOWER')).annotate(description_lower=Func(F('description'), function='LOWER'))
    serializer_class = ItemModelSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = ItemModelFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request, "model_search")


class InstrumentList(ListAPIView):
    # annotate list with most recent calibration and calibration expiration date
    max_date = datetime.date(9999, 12, 31)
    queryset = Instrument.objects.all().annotate(vendor_lower=Func(F('item_model__vendor'), function='LOWER')).annotate(
        model_number_lower=Func(F('item_model__model_number'), function='LOWER')).annotate(
        description_lower=Func(F('item_model__description'), function='LOWER')).annotate(
        serial_number_lower=Func(F('serial_number'), function='LOWER'))
    ''' duration_expression = F('item_model__calibration_frequency') * 86400000000
    duration_wrapped_expression = ExpressionWrapper(duration_expression, DurationField())
    expiration_expression = F('most_recent_calibration') + F('cal_freq')
    queryset = queryset.annotate(most_recent_calibration=Case(
        When(item_model__calibration_frequency__lte=0, then=max_date),
        default=Max('calibrationevent__date'),
        )).annotate(
        cal_freq=duration_wrapped_expression).annotate(
        calibration_expiration_date=Case(When(item_model__calibration_frequency__lte=0, then=max_date),
                                         When(most_recent_calibration__isnull=False, then=expiration_expression),
                                         default=None,
                                         output_field=DateField(), )) '''

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
