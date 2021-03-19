from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework_jwt.views import ObtainJSONWebToken

from django.contrib.auth.models import User
from django.http import FileResponse
from django.http.request import QueryDict
from django.db.models.functions import Lower

from backend.tables.models import ItemModel, Instrument, CalibrationEvent, UserType
from backend.tables.serializers import *
from backend.tables.utils import *
from backend.tables.filters import *


@api_view(['GET', 'PUT'])
def start_klufe(request):
    """
    GET: connect to SSH and provide login credentials.
    PUT: create Klufe 5700 calibration event; return primary key of created event.
    """
    if request.method == 'GET':

        return False
    elif request.method == 'PUT':

        return False


@api_view(['GET', 'PUT'])
def klufe_cal_detail(request, pk):
    """
    GET: get calibration summary.
    PUT: edit existing calibration event.
    """
    if request.method == 'GET':

        return False

    elif request.method == 'PUT':

        return False


@api_view(['PUT'])
def turn_source_on(request):
    """
    Sets the Klufe K5700 calibrator to ON.
    """

    return False


@api_view(['PUT'])
def turn_source_off(request):
    """
    Sets the Klufe K5700 calibrator to OFF.
    """

    return False


@api_view(['PUT'])
def set_source(request):
    """
    Sets the Klufe K5700 calibrator to the desired DC or AV voltage.
    """

    return False


@api_view(['PUT'])
def save_calibration(request, pk):
    """
    Validate and safe the current calibration.
    """

    return False


@api_view(['PUT'])
def disconnect_source(request):
    """
    Disconnect from Klufe K5700 calibrator via SSH.
    """

    return False
