from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Func, Q
from django.utils import timezone
from backend.tables.serializers import *
from backend.tables.models import ItemModel, Instrument
from backend.tables.filters import *
from backend.tables.utils import list_override, get_page_response, annotate_instruments, annotate_models
from backend.config.export_flags import MODEL_EXPORT, INSTRUMENT_EXPORT, ZIP_EXPORT
from backend.import_export.export_csv import handler


class ItemModelExport(ListAPIView):
    queryset = ItemModel.objects.all()
    serializer_class = ItemModelSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = ItemModelFilter

    def list(self, request, *args, **kwargs):
        qs = {'models': self.filter_queryset(self.get_queryset()), 'instruments': None}
        export_type = MODEL_EXPORT
        if 'export_instruments' in request.GET:
            qs['instruments'] = Instrument.objects.filter(item_model__in=qs['models'])
            export_type = ZIP_EXPORT
        return handler(qs, export_type)


class InstrumentExport(ListAPIView):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentWriteSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = InstrumentFilter

    def list(self, request, *args, **kwargs):
        qs = {'instruments': self.filter_queryset(self.get_queryset()), 'models': None}
        export_type = INSTRUMENT_EXPORT
        if 'export_models' in request.GET:
            qs['models'] = ItemModel.objects.filter(Q(instrument__in=qs['instruments'])).distinct()
            export_type = ZIP_EXPORT
        return handler(qs, export_type)


class ItemModelList(ListAPIView):
    queryset = annotate_models(ItemModel.objects.all())
    serializer_class = ItemModelSearchSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = ItemModelFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request)


class InstrumentList(ListAPIView):
    queryset = annotate_instruments(Instrument.objects.all())
    serializer_class = InstrumentSearchSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = InstrumentFilter

    def list(self, request, *args, **kwargs):
        return list_override(self, request)


class CalibrationEventList(ListAPIView):
    queryset = CalibrationEvent.objects.order_by('-date')
    serializer_class = SimpleCalibrationEventReadSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = CalibrationEventFilter

    def list(self, request, *args, **kwargs):
        nextPage = 1
        previousPage = 1
        queryset = self.filter_queryset(self.get_queryset())
        return get_page_response(queryset, request, self.serializer_class, nextPage, previousPage)
