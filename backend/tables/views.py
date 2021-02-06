from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from backend.tables.models import ItemModel, Instrument
from django.contrib.auth.models import User
from backend.tables.serializers import *


def index(request):
    return HttpResponse("Hello, world. You're at the tables index.")


@api_view(['GET', 'POST'])
def instruments_list(request):
    """
    List instruments, or create a new instrument.
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
            request.data['model'] = model.pk
        except ItemModel.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # add new instrument using itemmodel
        serializer = InstrumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def instruments_detail(request, vendor, model_number, serial_number):
    """
    Retrieve an instrument by id/pk.
    """
    try:
        instrument = Instrument.objects.get(vendor=vendor, model_number=model_number, serial_number=serial_number)
    except Instrument.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = InstrumentSerializer(instrument, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
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


@api_view(['GET', 'POST'])
def models_list(request):
    """
    List  models, or create a new model.
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
    Retrieve, update or delete a model by id/pk.
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