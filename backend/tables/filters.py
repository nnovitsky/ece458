import django_filters
from backend.tables.models import ItemModel, Instrument, CalibrationEvent


class ItemModelFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(lookup_expr='icontains')
    model_number = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = ItemModel
        fields = ['vendor', 'model_number', 'comment', 'description', 'calibration_frequency']


class InstrumentFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(field_name='item_model__vendor',lookup_expr='icontains')
    model_number = django_filters.CharFilter(field_name='item_model__model_number', lookup_expr='icontains')
    serial_number = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Instrument
        fields = ['item_model', 'comment', 'serial_number']


class CalibrationEventFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(field_name='instrument__item_model__vendor', lookup_expr='icontains')
    model_number = django_filters.CharFilter(field_name='instrument__item_model__model_number', lookup_expr='icontains')
    serial_number = django_filters.CharFilter(field_name='instrument__serial_number', lookup_expr='icontains')
    user = django_filters.CharFilter(field_name='user__username', lookup_expr='icontains')
    min_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = CalibrationEvent
        fields = ['instrument', 'date', 'user']
