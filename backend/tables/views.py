from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import ItemModel
from .serializers import *


def index(request):
    return HttpResponse("Hello, world. You're at the tables index.")


@api_view(['GET', 'POST'])
def models_list(request):
    """
    List  models, or create a new customer.
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
def models_detail(request, pk):
    """
    Retrieve, update or delete a model by id/pk.
    """
    try:
        model = ItemModel.objects.get(pk=pk)
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