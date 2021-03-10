import django_filters
from backend.tables.models import *


def category_filter(qs, name, value):
    lookup = '__'.join([name, 'pk'])
    if not value:
        return qs
    values = set(value.split(','))
    for pk in values:
        qs = qs.filter(**{lookup: pk})
    return qs


class ItemModelFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(lookup_expr='icontains')
    model_number = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    model_categories = django_filters.Filter(field_name='itemmodelcategory', method=category_filter)

    class Meta:
        model = ItemModel
        fields = ['vendor', 'model_number', 'comment', 'description', 'calibration_frequency', 'model_categories']


class InstrumentFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(field_name='item_model__vendor',lookup_expr='icontains')
    model_number = django_filters.CharFilter(field_name='item_model__model_number', lookup_expr='icontains')
    serial_number = django_filters.CharFilter(lookup_expr='icontains')
    model_pk = django_filters.NumberFilter(field_name='item_model__pk', lookup_expr='exact')
    description = django_filters.CharFilter(field_name='item_model__description', lookup_expr='icontains')
    instrument_categories = django_filters.Filter(field_name='instrumentcategory', method=category_filter)
    model_categories = django_filters.Filter(field_name='item_model__itemmodelcategory', method=category_filter)
    asset_tag = django_filters.CharFilter(field_name='asset_tag', lookup_expr='icontains')

    class Meta:
        model = Instrument
        fields = ['item_model', 'comment', 'serial_number', 'description']


class CalibrationEventFilter(django_filters.rest_framework.FilterSet):
    vendor = django_filters.CharFilter(field_name='instrument__item_model__vendor', lookup_expr='icontains')
    model_number = django_filters.CharFilter(field_name='instrument__item_model__model_number', lookup_expr='icontains')
    serial_number = django_filters.CharFilter(field_name='instrument__serial_number', lookup_expr='icontains')
    user = django_filters.CharFilter(field_name='user__username', lookup_expr='icontains')
    min_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    instrument_pk = django_filters.NumberFilter(field_name='instrument__pk', lookup_expr='exact')

    class Meta:
        model = CalibrationEvent
        fields = ['instrument', 'date', 'user']
