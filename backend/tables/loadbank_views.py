from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from backend.tables.models import *
from backend.tables.serializers import *
from backend.tables.utils import check_instrument_is_calibrated, validate_lb_cal
from backend.config.load_bank_config import LOAD_LEVELS


@api_view(['POST'])
def start_loadbank_cal(request):
    request.data['user'] = request.user.pk
    request.data['file_type'] = 'Load Bank'
    if 'cal_event_pk' in request.data:
        try:
            pk = request.data.pop('cal_event_pk')
            prev_cal_event = CalibrationEvent.objects.get(pk=pk)
        except CalibrationEvent.DoesNotExist:
            return Response({"calibration_event_error": ["Invalid calibration ID given."]}, status=status.HTTP_404_NOT_FOUND)
        if len(prev_cal_event.loadbankcalibration_set.all()) == 0:
            return Response({"calibration_event_error": ["Calibration event is not a loadbank calibration."]}, status=status.HTTP_404_NOT_FOUND)
        serializer = CalibrationEventWriteSerializer(prev_cal_event, data=request.data)
    else:
        prev_cal_event = None
        serializer = CalibrationEventWriteSerializer(data=request.data)

    if serializer.is_valid():
        cal_modes = serializer.validated_data['instrument'].item_model.calibrationmode_set.values_list("name", flat=True)
        if "load_bank" not in cal_modes:
            return Response({"calibration_event_error": ["Model is not eligible for loadbank calibration."]}, status=status.HTTP_400_BAD_REQUEST)
        cal_event = serializer.save()
        if not prev_cal_event:
            lb_cal = LoadBankCalibration(cal_event=cal_event)
            lb_cal.save()
        else:
            lb_cal = cal_event.loadbankcalibration_set.all()[0]
        return Response({'loadbank_calibration': {'pk': lb_cal.pk, 'cal_event_pk': cal_event.pk}}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_lb_cal_field(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    exp_dates = {}
    for instrument_field in ['voltmeter', 'shunt_meter']:
        if instrument_field in request.data:
            asset_tag = request.data.pop(instrument_field)
            error, instrument, exp_date = check_instrument_is_calibrated(asset_tag)
            if error:
                return Response({"loadbank_error": [error]}, status=status.HTTP_400_BAD_REQUEST)
            request.data[instrument_field + '_asset_tag'] = asset_tag
            request.data[instrument_field + '_vendor'] = instrument.item_model.vendor
            request.data[instrument_field + '_model_num'] = instrument.item_model.model_number
            exp_dates[instrument_field] = exp_date

    request.data['cal_event'] = lb_cal.cal_event.pk
    serializer = LBCalSerializer(lb_cal, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'data': serializer.data, 'expiration_dates': exp_dates}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_load_levels(request, lb_cal_pk, page):
    try:
        data = LOAD_LEVELS[page]
    except KeyError:
        return Response({"loadbank_error": ["Invalid page number."]}, status=status.HTTP_400_BAD_REQUEST)
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
        load_currents = lb_cal.loadcurrent_set.all()
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)
    result = []
    for load in data:
        prev_reading = load_currents.filter(index=load['index'])
        if len(prev_reading) == 0:
            result.append(load)
        else:
            serializer = LoadCurrentReadSerializer(prev_reading[0])
            result.append(serializer.data)
    result = sorted(result, key=lambda i: i['index'])
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_test_voltage(request):
    data = VOLTAGE_TEST
    return Response(data, status=status.HTTP_200_OK)


@api_view(['PUT'])
def add_current_reading(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    request.data['lb_cal'] = lb_cal.pk
    try:
        prev_reading = LoadCurrent.objects.get(lb_cal=lb_cal, load=request.data['load'])
        serializer = LoadCurrentWriteSerializer(prev_reading, data=request.data)
    except LoadCurrent.DoesNotExist:
        serializer = LoadCurrentWriteSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        reading = serializer.save()
        data = serializer.data
        reading.cr_ok = data['cr_ok']
        reading.ca_ok = data['ca_ok']
        reading.cr_error = data['cr_error']
        reading.ca_error = data['ca_error']
        reading.save()
        if data['ideal'] == 0 and (data['cr'] != 0 or data['ca'] != 0):
            error = NO_LOAD_ERROR_MESSAGE
        elif not data['cr_ok'] and not data['ca_ok']:
            error = CR_AND_CA_ERROR
        elif not data['cr_ok']:
            error = CR_ERROR_MESSAGE
        elif not data['ca_ok']:
            error = CA_ERROR_MESSAGE
        else:
            error = None
        return Response({'data': serializer.data, 'error': error}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def add_voltage_reading(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    request.data['lb_cal'] = lb_cal.pk
    try:
        prev_voltage = LoadVoltage.objects.get(lb_cal=lb_cal)
        serializer = LoadVoltageWriteSerializer(prev_voltage, data=request.data)
    except LoadVoltage.DoesNotExist:
        serializer = LoadVoltageWriteSerializer(data=request.data)

    if serializer.is_valid():
        reading = serializer.save()
        data = serializer.data
        reading.vr_ok = data['vr_ok']
        reading.va_ok = data['va_ok']
        reading.vr_error = data['vr_error']
        reading.va_error = data['va_error']
        reading.save()
        if not data['vr_ok'] and not data['va_ok']:
            error = VR_AND_VA_ERROR
        elif not data['vr_ok']:
            error = VR_ERROR_MESSAGE
        elif not data['va_ok']:
            error = VA_ERROR_MESSAGE
        else:
            error = None
        return Response({'data': data, 'error': error}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def cancel_lb_cal(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
        cal_event = CalibrationEvent.objects.get(pk=lb_cal.cal_event.pk)
    except LoadBankCalibration.DoesNotExist or CalibrationEvent.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)
    cal_event.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def lb_cal_details(request, lb_cal_pk):
    try:
        lb_cal = LoadBankCalibration.objects.get(pk=lb_cal_pk)
    except LoadBankCalibration.DoesNotExist:
        return Response({"loadbank_error": ["Loadbank calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    errors = validate_lb_cal(lb_cal)
    serializer = LBCalReadSerializer(lb_cal)
    return Response({"data": serializer.data, "errors": errors}, status=status.HTTP_200_OK)