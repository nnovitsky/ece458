import json
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from django.core.exceptions import FieldError
from django.test import Client
from django.urls import reverse
from backend.tables.models import *


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


def setUpTestAuth(class_object):
    class_object.client = Client()
    User.objects.all().delete()
    class_object.user_data = {
        'username': "newUser",
        'password': "pw123",
        'first_name': "fname",
        'last_name': "lname",
        'email': "e@g.com"
    }
    class_object.login_data = {
        'username': class_object.user_data['username'],
        'password': class_object.user_data['password']
    }
    class_object.token_staff, class_object.user_staff = make_user(username="newUser", is_staff=True, data=class_object.user_data,
                                                    login=class_object.login_data, client=class_object.client)
    class_object.token_non_staff, class_object.user_non_staff = make_user(username="newUser2", is_staff=False, data=class_object.user_data,
                                                            login=class_object.login_data, client=class_object.client)


def make_user(username, is_staff, data, login, client):
    data['username'] = username
    login['username'] = username
    u = User(**data)
    u.set_password("pw123")
    u.is_staff = is_staff
    u.save()
    response = client.post(reverse('token_auth'), data=json.dumps(login), content_type='application/json')
    return response.data['token'], u