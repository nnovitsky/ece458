import json
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework import status
from django.core.exceptions import FieldError
from django.db.models import Max, F, DurationField, DateField, ExpressionWrapper, Case, When, Func
from django.contrib.postgres.aggregates import ArrayAgg
from django.test import Client
from django.urls import reverse
from backend.tables.models import *
from backend.config.character_limits import *
from backend.tables.serializers import UserSerializerWithToken


def validate_user(request, create=False):
    if 'username' in request.data:
        if '@' in request.data['username']:
            return Response({'input_error': ["Username cannot contain '@' symbol."]}, status.HTTP_400_BAD_REQUEST)
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


def annotate_instruments(queryset):
    # annotate list with most recent calibration and calibration expiration date
    max_date = datetime.date(9999, 12, 31)
    min_date = datetime.date(1, 1, 1)
    queryset = queryset.annotate(vendor_lower=Func(F('item_model__vendor'), function='LOWER')).annotate(
        model_number_lower=Func(F('item_model__model_number'), function='LOWER')).annotate(
        description_lower=Func(F('item_model__description'), function='LOWER')).annotate(
        serial_number_lower=Func(F('serial_number'), function='LOWER'))
    queryset = queryset.annotate(vendor=F('item_model__vendor')).annotate(
        model_number=F('item_model__model_number')).annotate(
        description=F('item_model__description')
    )
    queryset = queryset.annotate(instrument_cats=ArrayAgg("instrumentcategory__name", distinct=True))
    queryset = queryset.annotate(model_cats=ArrayAgg("item_model__itemmodelcategory__name", distinct=True))

    # uncomment the multiplication if using sqlite bc sqlite DurationField defaults to milliseconds
    duration_expression = F('item_model__calibration_frequency')  # * 86400000000
    duration_wrapped_expression = ExpressionWrapper(duration_expression, DurationField())
    expiration_expression = F('most_recent_calibration') + F('cal_freq')
    queryset = queryset.annotate(most_recent_calibration=Case(
        When(item_model__calibration_frequency__lte=0, then=min_date),
        default=Max('calibrationevent__date'),
    )).annotate(
        cal_freq=duration_wrapped_expression).annotate(
        calibration_expiration_date=Case(When(item_model__calibration_frequency__lte=0, then=max_date),
                                         When(most_recent_calibration__isnull=False, then=expiration_expression),
                                         default=min_date,
                                         output_field=DateField(), ))
    return queryset


def list_override(list_view, request):
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
        return Response({'data': serializer.data, 'count': len(serializer.data)}, status=status.HTTP_200_OK)

    page = int(request.GET.get('page', 1))
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
    try:
        admin = UserType.objects.get(name="admin")
    except UserType.DoesNotExist:
        admin = UserType(name="admin").save()
    class_object.user_data = {
        'username': "newUser",
        'password': "pw123",
        'first_name': "fname",
        'last_name': "lname",
        'email': "e@g.com",
        'groups': []
    }
    class_object.login_data = {
        'username': class_object.user_data['username'],
        'password': class_object.user_data['password']
    }
    class_object.token_staff, class_object.user_staff = make_user(username="newUser", groups=['admin'], data=class_object.user_data,
                                                    login=class_object.login_data)
    class_object.token_non_staff, class_object.user_non_staff = make_user(username="newUser2", data=class_object.user_data,
                                                            login=class_object.login_data)


def make_user(username, data, login, groups=[]):
    data['username'] = username
    login['username'] = username
    data['groups'] = groups
    serializer = UserSerializerWithToken(data=data)
    if serializer.is_valid():
        u = serializer.save()
    return serializer.data['token'], u