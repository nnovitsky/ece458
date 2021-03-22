from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework_jwt.views import ObtainJSONWebToken

from django.contrib.auth.models import User
from django.http import FileResponse
from django.http.request import QueryDict
from django.db.models.functions import Lower

from backend.tables.models import ItemModel, Instrument, CalibrationEvent, UserType, KlufeCalibration
from backend.tables.serializers import *
from backend.tables.utils import *
from backend.tables.filters import *


@api_view(['GET', 'PUT'])
def start_klufe(request):
    """
    GET: connect to SSH and provide login credentials.
    PUT: create Klufe 5700 calibration event; return primary key of created event.
    """
    if not UserType.contains_user(request.user, "calibrations"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    request.data['user'] = request.user.pk
    if request.method == 'GET':

        return False
    elif request.method == 'PUT':
        serializer = CalibrationEventWriteSerializer(data=request.data)
        if serializer.is_valid():
            cal_modes = serializer.validated_data['instrument'].item_model.calibrationmode_set.values_list("name", flat=True)
            if "klufe_k5700" not in cal_modes:
                return Response({"calibration_event_error": ["Model is not eligible for klufe calibration."]}, status=status.HTTP_400_BAD_REQUEST)
            cal_event = serializer.save()
            klufe_cal = KlufeCalibration(cal_event=cal_event)
            klufe_cal.save()
            return Response({'klufe_calibration': {'pk': klufe_cal.pk, 'cal_event_pk': cal_event.pk}},
                            status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def klufe_cal_detail(request, pk):
    """
    GET: get calibration summary.
    PUT: edit existing calibration event.
    """
    if request.method == 'GET':

        try:
            klufe_cal = KlufeCalibration.objects.get(pk=pk)
        except KlufeCalibration.DoesNotExist:
            return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]},
                            status=status.HTTP_404_NOT_FOUND)

        errors = validate_klufe_cal(klufe_cal)
        serializer = KlufeCalReadSerializer(lb_cal)
        return Response({"data": serializer.data, "errors": errors}, status=status.HTTP_200_OK)



        return False

    elif request.method == 'PUT':
        if not UserType.contains_user(request.user, "calibrations"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        return False


@api_view(['POST'])
def turn_source_on(request):
    """
    Sets the Klufe K5700 calibrator to ON.
    """

    return False


@api_view(['POST'])
def turn_source_off(request):
    """
    Sets the Klufe K5700 calibrator to OFF.
    """

    return False


@api_view(['POST'])
def set_source(request):
    """
    Set the Klufe K5700 calibrator to the desired DC or AV voltage.
    """

    return False


@api_view(['PUT'])
def save_calibration(request, pk):
    """
    Validate and save the current calibration.
    """

    return False


@api_view(['GET'])
def disconnect_source(request):
    """
    Disconnect from Klufe K5700 calibrator via SSH.
    """

    return False


@api_view(['DELETE'])
def cancel_klufe_cal(request, pk):
    """
    Should a user disconnect or exit the calibration before a Klufe calibration
    event has been saved and validated.
    """
    try:
        klufe_cal = KlufeCalibration.objects.get(pk=pk)
        cal_event = CalibrationEvent.objects.get(pk=klufe_cal.cal_event.pk)
    except KlufeCalibration.DoesNotExist or CalibrationEvent.DoesNotExist:
        return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)
    cal_event.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
