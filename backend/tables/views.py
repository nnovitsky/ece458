from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from django.contrib.auth.models import User
from backend.tables.serializers import *
from backend.tables.utils import get_page_response
from backend.tables.filters import *


def index(request):
    return HttpResponse("Hello, world. You're at the tables index.")


# CALIBRATION EVENTS
@api_view(['GET', 'POST'])
def calibration_event_list(request):
    """
    List all calibration event, or create a new calibration event.
    Returns 200 on successful GET, 201 on successful POST, 400 on invalid POST request data.
    """
    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        calibration_events = CalibrationEvent.objects.all()
        return get_page_response(calibration_events, request, CalibrationEventReadSerializer, "calibration_events", nextPage, previousPage)

    elif request.method == 'POST':
        # get instrument pk from vendor, model number, serial number
        # get user pk from username
        try:
            vendor = request.data['vendor']
            model_number = request.data['model_number']
            serial_number = request.data['serial_number']
            username = request.data['user']
            instrument = Instrument.objects.get(vendor=vendor, model_number=model_number, serial_number=serial_number)
            user = User.objects.get(username=username)
            request.data['instrument'] = instrument.pk
            request.data['user'] = user.pk
        except Instrument.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # add new calibration event using instrument and user
        serializer = CalibrationEventWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def calibration_event_detail(request, pk):
    """
    Retrieve, edit, or delete an instrument by primary key.
    Returns 404 if calibration event not found, 400 if data to edit calibration event is invalid, 200 on successful
    GET or PUT, 204 on successful DELETE.
    """
    try:
        calibration_event = CalibrationEvent.objects.get(pk=pk)
    except CalibrationEvent.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CalibrationEventReadSerializer(calibration_event, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
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

        serializer = CalibrationEventWriteSerializer(calibration_event, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        calibration_event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# INSTRUMENTS
@api_view(['GET', 'POST'])
def instruments_list(request):
    """
    List instruments, or create a new instrument.
    Returns 200 on successful GET, 201 on successful POST, 400 on invalid POST request data.
    """
    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        instruments = Instrument.objects.all()
        return get_page_response(instruments, request, InstrumentReadSerializer, "instruments", nextPage, previousPage)

    elif request.method == 'POST':
        # get model pk from vendor and model number
        try:
            vendor = request.data['vendor']
            model_number = request.data['model_number']
            model = ItemModel.objects.get(vendor=vendor, model_number=model_number)
            request.data['item_model'] = model.pk
        except ItemModel.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # add new instrument using itemmodel
        serializer = InstrumentWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def instruments_detail(request, pk):
    """
    Retrieve, edit, or delete an instrument by pk.
    Returns 404 if instrument or reference model not found, 400 if data to edit instrument is invalid, 200 on successful
    GET or PUT, 204 on successful DELETE.
    """
    try:
        instrument = Instrument.objects.get(pk=pk)
    except Instrument.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InstrumentReadSerializer(instrument, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        # fill in immutable fields
        request.data['item_model'] = instrument.item_model.pk
        request.data['vendor'] = instrument.vendor
        request.data['model_number'] = instrument.model_number
        request.data['serial_number'] = instrument.serial_number
        serializer = InstrumentWriteSerializer(instrument, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instrument.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# MODELS
@api_view(['GET', 'POST'])
def models_list(request):
    """
    List  models, or create a new model.
    Returns 200 on successful GET, 201 on successful POST, 400 on bad POST request data.
    """
    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        models = ItemModel.objects.all()
        return get_page_response(models, request, ItemModelSerializer, "models", nextPage, previousPage)

    elif request.method == 'POST':
        serializer = ItemModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def models_detail(request, pk):
    """
    Retrieve, update or delete a model by pk.
    Returns 404 if model does not exist, 200 on successful GET or PUT, 400 on bad PUT request data,
    204 on successful DELETE.
    """
    try:
        model = ItemModel.objects.get(pk=pk)
    except ItemModel.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ItemModelSerializer(model, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        # fill in immutable fields
        request.data['vendor'] = model.vendor
        request.data['model_number'] = model.model_number
        serializer = ItemModelSerializer(model, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# USERS
@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data.
    Returns 200 on successful GET.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
