from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from django.contrib.auth.models import User
from backend.tables.serializers import *


def index(request):
    return HttpResponse("Hello, world. You're at the tables index.")

#
# # CALIBRATION EVENTS
# @api_view(['GET', 'POST'])
# def calibration_event_list(request):
#     """
#     List calibration events for a single instrument, or create a new calibration event.
#     Returns 200 on successful GET, 201 on successful POST, 400 on invalid POST request data.
#     """
#     if request.method == 'GET':
#         # TODO: filtering
#         return None
#         # data = []
#         # nextPage = 1
#         # previousPage = 1
#         # instruments = CalibrationEvent.objects.all()
#         # page = request.GET.get('page', 1)
#         # paginator = Paginator(instruments, 10)
#         # try:
#         #     data = paginator.page(page)
#         # except PageNotAnInteger:
#         #     data = paginator.page(1)
#         # except EmptyPage:
#         #     data = paginator.page(paginator.num_pages)
#         #
#         # serializer = InstrumentSerializer(data, context={'request': request}, many=True)
#         # if data.has_next():
#         #     nextPage = data.next_page_number()
#         # if data.has_previous():
#         #     previousPage = data.previous_page_number()
#         #
#         # return Response({'data': serializer.data, 'count': paginator.count, 'numpages': paginator.num_pages, 'nextlink': '/api/instruments/?page=' + str(nextPage), 'prevlink': '/api/instruments/?page=' + str(previousPage)})
#
#     elif request.method == 'POST':
#         # get instrument pk from vendor and model number
#         try:
#             vendor = request.data['vendor']
#             model_number = request.data['model_number']
#             model = ItemModel.objects.get(vendor=vendor, model_number=model_number)
#             request.data['item_model'] = model.pk
#         except ItemModel.DoesNotExist:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#         # add new instrument using itemmodel
#         serializer = InstrumentSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def instruments_detail(request, vendor, model_number, serial_number):
    """
    Retrieve, edit, or delete an instrument by vendor + model + serial number.
    Returns 404 if instrument or reference model not found, 400 if data to edit instrument is invalid, 200 on successful
    GET or PUT, 204 on successful DELETE.
    """
    try:
        instrument = Instrument.objects.get(vendor=vendor, model_number=model_number, serial_number=serial_number)
    except Instrument.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InstrumentSerializer(instrument, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        try:
            model = ItemModel.objects.get(vendor=vendor, model_number=model_number)
            request.data['item_model'] = model.pk
        except Instrument.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = InstrumentSerializer(instrument, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        instrument.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# INSTRUMENTS
@api_view(['GET', 'POST'])
def instruments_list(request):
    """
    List instruments, or create a new instrument.
    Returns 200 on successful GET, 201 on successful POST, 400 on invalid POST request data.
    """
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        instruments = Instrument.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(instruments, 10)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = InstrumentSerializer(data, context={'request': request}, many=True)
        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()

        return Response({'data': serializer.data, 'count': paginator.count, 'numpages': paginator.num_pages, 'nextlink': '/api/instruments/?page=' + str(nextPage), 'prevlink': '/api/instruments/?page=' + str(previousPage)})

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
        serializer = InstrumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def instruments_detail(request, vendor, model_number, serial_number):
    """
    Retrieve, edit, or delete an instrument by vendor + model + serial number.
    Returns 404 if instrument or reference model not found, 400 if data to edit instrument is invalid, 200 on successful
    GET or PUT, 204 on successful DELETE.
    """
    try:
        instrument = Instrument.objects.get(vendor=vendor, model_number=model_number, serial_number=serial_number)
    except Instrument.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InstrumentSerializer(instrument, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        try:
            model = ItemModel.objects.get(vendor=vendor, model_number=model_number)
            request.data['item_model'] = model.pk
        except Instrument.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = InstrumentSerializer(instrument, data=request.data, context={'request': request})
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
        data = []
        nextPage = 1
        previousPage = 1
        models = ItemModel.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(models, 10)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = ItemModelSerializer(data, context={'request': request}, many=True)
        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()

        return Response({'data': serializer.data, 'count': paginator.count, 'numpages': paginator.num_pages, 'nextlink': '/api/models/?page=' + str(nextPage), 'prevlink': '/api/models/?page=' + str(previousPage)})

    elif request.method == 'POST':
        serializer = ItemModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def models_detail(request, vendor, model_number):
    """
    Retrieve, update or delete a model by vendor + model number.
    Returns 404 if model does not exist, 200 on successful GET or PUT, 400 on bad PUT request data,
    204 on successful DELETE.
    """
    try:
        model = ItemModel.objects.get(vendor=vendor, model_number=model_number)
    except ItemModel.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ItemModelSerializer(model, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
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
