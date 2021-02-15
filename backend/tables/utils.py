from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from django.core.exceptions import FieldError
from backend.config.character_limits import *


def validate_user(request, create=False):
    if 'username' in request.data:
        if len(request.data['username']) > USERNAME_MAX_LENGTH:
            return Response({'input_error': [f"Username must be less than {USERNAME_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['username']) == 0:
            return Response({'input_error': ["Username is required."]}, status.HTTP_400_BAD_REQUEST)

    if 'first_name' in request.data:
        if len(request.data['first_name']) > FIRST_NAME_MAX_LENGTH:
            return Response({'input_error': [f"First name must be less than {FIRST_NAME_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['first_name']) == 0:
            return Response({'input_error': ["First name is required."]}, status.HTTP_400_BAD_REQUEST)
    elif create:
        return Response({'input_error': ['First name is required.']}, status=status.HTTP_400_BAD_REQUEST)

    if 'last_name' in request.data:
        if len(request.data['last_name']) > LAST_NAME_MAX_LENGTH:
            return Response({'input_error': [f"Last name must be less than {LAST_NAME_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['last_name']) == 0:
            return Response({'input_error': ["Last name is required."]}, status.HTTP_400_BAD_REQUEST)
    elif create:
        return Response({'input_error': ['Last name is required.']}, status=status.HTTP_400_BAD_REQUEST)

    if 'email' in request.data:
        if len(request.data['email']) > EMAIL_MAX_LENGTH:
            return Response({'input_error': [f"Email must be less than {EMAIL_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['email']) == 0:
            return Response({'input_error': ["Email is required."]}, status.HTTP_400_BAD_REQUEST)
    elif create:
        return Response({'input_error': ['Email is required.']}, status=status.HTTP_400_BAD_REQUEST)

    if 'password' in request.data:
        if len(request.data['password']) > PASSWORD_MAX_LENGTH:
            return Response({'input_error': [f"Password must be less than {PASSWORD_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['password']) == 0:
            return Response({'input_error': ["Password is required."]}, status.HTTP_400_BAD_REQUEST)
    return None


def list_override(list_view, request, name):
    queryset = list_view.filter_queryset(list_view.get_queryset())
    if "sort_by" in request.GET:
        try:
            queryset = queryset.order_by(request.GET["sort_by"])
        except FieldError:
            return Response("Invalid sorting parameter.", status=status.HTTP_400_BAD_REQUEST)
    nextPage = 1
    previousPage = 1
    return get_page_response(queryset, request, list_view.serializer_class, nextPage, previousPage)


def get_page_response(objects, request, serializerType, nextPage, previousPage):
    # reusable pagination function
    if 'get_all' in request.GET:
        serializer = serializerType(objects, context={'request': request}, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)

    page = request.GET.get('page', 1)
    paginator = Paginator(objects, 10)
    try:
        data = paginator.page(page)
    except PageNotAnInteger:
        data = paginator.page(1)
        page = 1
    except EmptyPage:
        data = paginator.page(paginator.num_pages)
        page = paginator.num_pages

    serializer = serializerType(data, context={'request': request}, many=True)
    if data.has_next():
        nextPage = data.next_page_number()
    if data.has_previous():
        previousPage = data.previous_page_number()

    return Response({'data': serializer.data, 'count': paginator.count, 'numpages': paginator.num_pages,
                     'currentpage': page, 'nextpage': nextPage, 'previouspage': previousPage})
