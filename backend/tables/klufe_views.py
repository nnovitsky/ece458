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
    if request.method == 'GET':
        # connect to ssh via terminal

    elif request.method == 'PUT':
        # create klufe cal_event, return pk


@api_view(['GET', 'PUT'])
def klufe_cal_detail(request, pk):
    if request.method == 'GET':
        # get calibration fields/summary

    elif request.method == 'PUT':
        # edit existing event
