from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from backend.tables.models import *
from backend.tables.serializers import *
from backend.tables.utils import check_instrument_is_calibrated
from backend.config.load_bank_config import LOAD_LEVELS


@api_view(['POST'])
def start_loadbank_cal(request):
    request.data['user'] = request.user.pk
    serializer = CalibrationEventWriteSerializer(data=request.data)
    if serializer.is_valid():
        cal_event = serializer.save()
        lb_cal = LoadBankCalibration(cal_event=cal_event)
        lb_cal.save()
        return Response({'loadbank_calibration': {'pk': lb_cal.pk}}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_asset_numbers(request, model_pk):
    try:
        model = ItemModel.objects.get(pk=model_pk)
    except ItemModel.DoesNotExist:
        return Response({"model_error": ["Model does not exist."]}, status=status.HTTP_404_NOT_FOUND)
    instruments = model.instrument_set.all()
    asset_numbers = [{"asset_number": ins.serial_number, "pk": ins.pk} for ins in instruments]
    return Response(asset_numbers, status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_lb_cal_field(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    for instrument_field in ['voltmeter', 'shunt_meter']:
        if instrument_field in request.data:
            error = check_instrument_is_calibrated(request.data[instrument_field])
            if error:
                return Response({"loadbank_error": [error]}, status=status.HTTP_400_BAD_REQUEST)

    request.data['cal_event'] = lb_cal.cal_event.pk
    serializer = LBCalSerializer(lb_cal, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_load_levels(request, page):
    try:
        data = LOAD_LEVELS[page]
    except KeyError:
        return Response({"loadbank_error": ["Invalid page number."]}, status=status.HTTP_400_BAD_REQUEST)
    data = sorted(data, key=lambda i: i['index'])
    return Response(data, status=status.HTTP_200_OK)


@api_view(['PUT'])
def add_current_reading(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    request.data['lb_cal'] = lb_cal.pk
    serializer = LoadCurrentWriteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


