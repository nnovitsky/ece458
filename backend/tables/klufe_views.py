import time

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import paramiko

from backend.tables.models import ItemModel, Instrument, CalibrationEvent, UserType, KlufeCalibration
from backend.tables.serializers import *
from backend.tables.utils import *
from backend.tables.filters import *
from backend.config.klufe_config import HOST, PORT, SSH_USER, SSH_PASS, VOLTAGE_LEVELS


@api_view(['GET', 'PUT'])
def start_klufe(request):
    """
    GET: connect to SSH and provide login credentials.
    PUT: create Klufe 5700 calibration event; return primary key of created event.
    """
    if not UserType.contains_user(request.user, "calibrations"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            ssh.connect(HOST, PORT, SSH_USER, SSH_PASS)
            channel = ssh.invoke_shell()
            time.sleep(0.001)
            channel.send('help')
            time.sleep(0.001)
            channel_output = channel.recv(65535).decode('ascii')
        except paramiko.SSHException:
            return Response({"SSH_error": ["Failed to connect to remote Klufe server."],
                             "connected": [False]})

        ssh.close()
        return Response({"Klufe SSH data": [channel_output]}, status=status.HTTP_200_OK)
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
def klufe_cal_detail(request, klufe_pk):
    """
    GET: get calibration summary.
    PUT: edit existing calibration event.
    """
    if request.method == 'GET':
        try:
            klufe_cal = KlufeCalibration.objects.get(pk=klufe_pk)
        except KlufeCalibration.DoesNotExist:
            return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]},
                            status=status.HTTP_404_NOT_FOUND)

        errors = validate_klufe_cal(klufe_cal)
        serializer = KlufeCalReadSerializer(klufe_cal)
        return Response({"data": serializer.data, "errors": errors}, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if not UserType.contains_user(request.user, "calibrations"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        return False


@api_view(['PUT'])
def klufe_test(request, klufe_pk):
    if not UserType.contains_user(request.user, "calibrations"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        klufe_cal = KlufeCalibration.objects.get(pk=klufe_pk)
    except KlufeCalibration.DoesNotExist:
        return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]},
                        status=status.HTTP_404_NOT_FOUND)

    if request.data['index'] is not None and request.data['value'] is not None:
        test_index = request.data['index']
        value = request.data['value']
    else:
        return Response({'klufe_calibration_request_error': ["Missing fields from request."]},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        test = VOLTAGE_LEVELS[test_index]
    except IndexError:
        return Response({"klufe_calibration_request_error": [f"Index value {test_index} has no corresponding test."]},
                        status=status.HTTP_404_NOT_FOUND)

    if value < test['lower']:
        return Response({"klufe_calibration_test_failed": [f"Provided voltage value of {value}V is too low. "
                                                          f"Cannot be lower than {test['lower']}V ({test['description']}"
                                                           f")"]}, status=status.HTTP_412_PRECONDITION_FAILED)
    elif value > test['upper']:
        return Response({"klufe_calibration_test_failed": [f"Provided voltage value of {value}V is too high. "
                                                          f"Cannot be higher than {test['upper']}V ({test['description']}"
                                                          f")"]}, status=status.HTTP_412_PRECONDITION_FAILED)
    else:
        voltage_reading = {
            'klufe_cal': klufe_cal.pk,
            'index': test_index,
            'source_voltage': test['source_voltage'],
            'reported_voltage':value,
            'voltage_okay':True
        }
        serializer = KlufeVoltageSerializer(data=voltage_reading)
        if serializer.is_valid(): serializer.save()
        return Response({'klufe_calibration_test_success': [voltage_reading]}, status=status.HTTP_200_OK)


@api_view(['POST'])
def turn_source_on(request):
    """
    Sets the Klufe K5700 calibrator to ON.
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(HOST, PORT, SSH_USER, SSH_PASS)
        channel = ssh.invoke_shell()
        time.sleep(0.001)
        channel.send('on')
        time.sleep(0.001)
        channel_output = channel.recv(65535).decode('ascii')
    except paramiko.SSHException:
        return Response({"SSH_error": ["Failed to connect to remote Klufe server."],
                         "connected": [False]})

    ssh.close()

    return Response({"SSH_success": ["Successfully turned the Klufe calibrator on."],
                     "connected": [True]})


@api_view(['POST'])
def turn_source_off(request):
    """
    Sets the Klufe K5700 calibrator to OFF.
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(HOST, PORT, SSH_USER, SSH_PASS)
        channel = ssh.invoke_shell()
        time.sleep(0.001)
        channel.send('off')
        time.sleep(0.001)
        channel_output = channel.recv(65535).decode('ascii')
    except paramiko.SSHException:
        return Response({"SSH_error": ["Failed to connect to remote Klufe server."],
                         "connected": [False]})

    ssh.close()

    return Response({"SSH_success": ["Successfully turned the Klufe calibrator on."],
                     "connected": [True]})


@api_view(['POST'])
def set_source(request):
    """
    Set the Klufe K5700 calibrator to the desired DC or AV voltage.
    """
    if request.data['index'] is not None:
        try:
            test = VOLTAGE_LEVELS[request.data['index']]
        except IndexError:
            return Response(
                {"klufe_calibration_request_error": [f"Index value {request.data['index']} has no corresponding test."]},
                status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'klufe_calibration_request_error': ["Missing fields from request."]},
                        status=status.HTTP_400_BAD_REQUEST)

    if test['is_AC']:
        klufe_input = f"set ac {test['source_voltage']} {test['Hz']}"
    else:
        klufe_input = f"set dc {test['source_voltage']}"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(HOST, PORT, SSH_USER, SSH_PASS)
        channel = ssh.invoke_shell()
        time.sleep(0.001)
        channel.send(klufe_input)
        time.sleep(0.001)
        channel_output = channel.recv(65535).decode('ascii')
    except paramiko.SSHException:
        return Response({"SSH_error": ["Failed to connect to remote Klufe server."]})

    ssh.close()
    return False


@api_view(['PUT'])
def save_calibration(request, klufe_pk):
    """
    Validate and save the current calibration.
    """
    try:
        klufe_cal = KlufeCalibration.objects.get(pk=klufe_pk)
    except KlufeCalibration.DoesNotExist:
        return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]},
                        status=status.HTTP_404_NOT_FOUND)

    klufe_details = validate_klufe_cal(klufe_cal)

    if klufe_details['valid']:
        klufe_cal.completed_cal = True
        klufe_cal.save()
        serializer = KlufeCalSerializer(klufe_cal)
        return Response({"data": serializer.data, "errors": klufe_details}, status=status.HTTP_200_OK)

    else:
        return Response({"klufe_calibration_error": [klufe_details]},
                        status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def cancel_klufe_cal(request, klufe_pk):
    """
    Should a user disconnect or exit the calibration before a Klufe calibration
    event has been saved and validated.
    """
    try:
        klufe_cal = KlufeCalibration.objects.get(pk=klufe_pk)
        cal_event = CalibrationEvent.objects.get(pk=klufe_cal.cal_event.pk)
    except KlufeCalibration.DoesNotExist or CalibrationEvent.DoesNotExist:
        return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)
    cal_event.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
