import time

from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import paramiko

from backend.tables.models import ItemModel, Instrument, CalibrationEvent, UserType, KlufeCalibration
from backend.tables.serializers import *
from backend.tables.utils import *
from backend.tables.filters import *
from backend.config.klufe_config import HOST, PORT, SSH_USER, SSH_PASS, VOLTAGE_LEVELS
import backend.tables.cal_with as cal_with


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
            channel.send('set dc 0.0\n')
            time.sleep(0.001)
            channel_output = channel.recv(65535).decode('ascii')
        except paramiko.SSHException:
            return Response({"SSH_error": ["Failed to connect to remote Klufe server."],
                             "connected": [False]})

        ssh.close()
        return Response({"SSH_success": ["Successfully turned the Klufe calibrator on."],
                     "connected": [True]})
    elif request.method == 'PUT':
        request.data['file_type'] = 'Klufe'
        try:
            ins = Instrument.objects.get(pk=request.data['instrument'])
            model = ins.item_model
        except Instrument.DoesNotExist or ItemModel.DoesNotExist:
            return Response({"description": ["Instrument or model does not exist."]},
                            status=status.HTTP_400_BAD_REQUEST)
        if model.requires_approval:
            request.data['approval_status'] = APPROVAL_STATUSES['pending']

        if len(request.data['calibrated_by_instruments']) > 0:
            valid_cal, error = cal_with.validate_helper(ins.item_model.pk, request.data['calibrated_by_instruments'], ins.pk)
            if not valid_cal:
                return Response({"description": [error]}, status=status.HTTP_400_BAD_REQUEST)

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
        #Overwrite previous test
        KlufeVoltageReading.objects.filter(klufe_cal=klufe_pk, index=test_index).delete()
        voltage_reading = {
            'klufe_cal': klufe_cal.pk,
            'index': test_index,
            'source_voltage': test['source_voltage'],
            'reported_voltage':value,
            'voltage_okay':True
        }

        if test['is_AC']: voltage_reading['source_hertz'] = test['Hz']

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
        channel.send('on\n')
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
        channel.send('off\n')
        time.sleep(0.001)
        channel_output = channel.recv(65535).decode('ascii')
    except paramiko.SSHException:
        return Response({"SSH_error": ["Failed to connect to remote Klufe server."],
                         "connected": [False]})

    ssh.close()

    return Response({"SSH_success": ["Successfully turned the Klufe calibrator off."],
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
        klufe_input = f"set ac {test['source_voltage']} {test['Hz']}\n"
    else:
        klufe_input = f"set dc {test['source_voltage']}\n"

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
    return Response({"SSH_success": ["Successfully set the Klufe calibrator to the source value."],
                     "connected": [True]})


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
        klufe_cal.cal_event.file_type = 'Klufe'
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


@api_view(['PUT'])
def edit_klufe_cal(request, klufe_pk):
    """
    Endpoint for updating Klufe cal metadata (i.e. comment or date)
    """
    try:
        klufe_cal = KlufeCalibration.objects.get(pk=klufe_pk)
        calibration_event = CalibrationEvent.objects.get(pk=klufe_cal.cal_event.pk)
    except KlufeCalibration.DoesNotExist or CalibrationEvent.DoesNotExist:
        return Response({"klufe_calibration_error": ["Klufe calibration event does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    if not UserType.contains_user(request.user, "calibrations"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
    # fill in immutable fields and grab new user's pk
    request.data['instrument'] = calibration_event.instrument.pk
    if 'username' in request.data:
        try:
            username = request.data['username']
            user = User.objects.get(username=username)
            request.data['user'] = user.pk
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    else:
        request.data['user'] = calibration_event.user.pk
    if 'date' not in request.data: request.data['date'] = calibration_event.date

    serializer = CalibrationEventWriteSerializer(calibration_event, data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
