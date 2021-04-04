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
from backend.config.load_bank_config import CALIBRATION_MODES, LOAD_LEVELS
from backend.config.admin_config import USER_GROUPS
from backend.config.klufe_config import VOLTAGE_LEVELS


def validate_user(request, create=False):
    if 'username' in request.data:
        if '@' in request.data['username']:
            return Response({'input_error': ["Username cannot contain '@' symbol."]}, status.HTTP_400_BAD_REQUEST)
        if len(request.data['username']) > USERNAME_MAX_LENGTH:
            return Response({'input_error': [f"Username must be less than {USERNAME_MAX_LENGTH} characters."]}, status.HTTP_400_BAD_REQUEST)
        elif len(request.data['username']) == 0:
            return Response({'input_error': ["Username is required."]}, status.HTTP_400_BAD_REQUEST)
        deleted_user_usernames = User.objects.filter(is_active=False).values_list('username', flat=True)
        if request.data['username'] in deleted_user_usernames:
            return Response({'input_error': ["Username belongs to a deactivated user."]}, status.HTTP_400_BAD_REQUEST)

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


def edit_user_groups(groups, other_user):
    # preserve oauth
    if UserType.contains_user(other_user, "oauth"):
        groups.add("oauth")
    # add related permissions
    if 'admin' in groups:
        groups.add('models')
        groups.add('instruments')
        groups.add('calibrations')
    elif 'models' in groups:
        groups.add('instruments')

    # ensure groups exist
    for groupname in groups:
        if groupname not in USER_GROUPS:
            return "ERROR"
        try:
            UserType.objects.get(name=groupname)
        except UserType.DoesNotExist:
            UserType(name=groupname).save()

    # adjust user's permissions
    qs = UserType.objects.filter(name__in=groups)
    other_user.usertype_set.set(qs)
    return groups


def annotate_models(queryset):
    queryset = queryset.annotate(vendor_lower=Func(F('vendor'), function='LOWER')).annotate(
        model_number_lower=Func(F('model_number'), function='LOWER')).annotate(
        description_lower=Func(F('description'), function='LOWER'))
    queryset = queryset.annotate(model_cats=ArrayAgg("itemmodelcategory__name", distinct=True))
    queryset = queryset.annotate(calibration_modes=ArrayAgg("calibrationmode__name", distinct=True))
    return queryset


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

    try:
        results_per_page = int(request.GET.get('results_per_page', 10))
        if results_per_page <= 0: raise ValueError
    except ValueError:
        results_per_page = 10
    try:
        page = int(request.GET.get('page', 1))
    except ValueError:
        page = 1

    paginator = Paginator(objects, results_per_page)
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
    serializer = UserSerializerWithToken(data=data)
    if serializer.is_valid():
        u = serializer.save()
    edit_user_groups(set(groups), u)
    return serializer.data['token'], u


def check_instrument_is_calibrated(instrument_asset_tag):
    try:
        instrument = Instrument.objects.get(asset_tag=instrument_asset_tag)
    except Instrument.DoesNotExist:
        return "Instrument does not exist.", None, None

    cal_frequency = instrument.item_model.calibration_frequency
    if cal_frequency < 1:
        return "Instrument not calibratable.", None, None
    last_cal = instrument.calibrationevent_set.order_by('-date')[:1]
    if len(last_cal) > 0:
        last_cal = last_cal[0]
        exp_date = last_cal.date + datetime.timedelta(cal_frequency)
        if exp_date >= datetime.date.today():
            return None, instrument, exp_date
        else:
            return "Instrument out of calibration.", None, None
    else:
        return "Instrument not calibrated.", None, None


def get_calibration_mode_pks(request):
    mode_pks = []
    if 'calibration_modes' in request.data:
        for mode_name in request.data['calibration_modes']:
            try:
                mode = CalibrationMode.objects.get(name=mode_name)
            except CalibrationMode.DoesNotExist:
                if mode_name not in CALIBRATION_MODES:
                    return None, {"mode_error": ["Invalid calibration mode."]}
                mode = CalibrationMode(name=mode_name)
                mode.save()
            mode_pks.append(mode.pk)
    return mode_pks, None


def validate_lb_cal(lb_cal):
    expected_load_readings = {}
    for page in LOAD_LEVELS:
        for level in LOAD_LEVELS[page]:
            expected_load_readings[level['index']] = level['load']
    unacceptable_load_readings = []
    for reading in lb_cal.loadcurrent_set.all():
        if not reading.cr_ok or not reading.ca_ok:
            unacceptable_load_readings.append(reading.load)
        expected_load_readings.pop(reading.index)

    try:
        v_test = lb_cal.loadvoltage
    except LoadBankCalibration.loadvoltage.RelatedObjectDoesNotExist:
        v_test = None
    voltage_error = None
    if v_test and (not v_test.vr_ok or not v_test.va_ok):
        voltage_error = "Unacceptable voltage test results."
    elif not v_test:
        voltage_error = "Missing voltage test."

    bool_fields = ["visual_inspection", "auto_cutoff", "alarm", "recorded_data", "printer"]
    bool_errors = []
    for field in bool_fields:
        if not getattr(lb_cal, field):
            bool_errors.append(field)

    voltmeter_asset_tag = lb_cal.voltmeter_asset_tag
    if not voltmeter_asset_tag:
        voltmeter_error = "No voltmeter given."
    else:
        voltmeter_cal_error, instrument, expiration_date = check_instrument_is_calibrated(voltmeter_asset_tag)
        voltmeter_error = voltmeter_cal_error

    shunt_asset_tag = lb_cal.shunt_meter_asset_tag
    if not shunt_asset_tag:
        shunt_error = "No current shunt meter given."
    else:
        shunt_cal_error, instrument, expiration_date = check_instrument_is_calibrated(shunt_asset_tag)
        shunt_error = shunt_cal_error

    valid = (not voltage_error and len(unacceptable_load_readings) == 0 and len(expected_load_readings) == 0 and
             len(bool_errors) == 0 and not voltmeter_error and not shunt_error)
    error = {
        "voltage_test_error": voltage_error,
        "unacceptable_load_readings": unacceptable_load_readings,
        "missing_load_readings": [expected_load_readings[index] for index in expected_load_readings],
        "failed_boolean_checks": bool_errors,
        "voltmeter_error": voltmeter_error,
        "shunt_meter_error": shunt_error,
        "valid": valid
    }
    return error


def validate_klufe_cal(klufe_cal):
    expected_readings = range(len(VOLTAGE_LEVELS))
    readings = KlufeVoltageReading.objects.filter(klufe_cal=klufe_cal.pk).values_list('index', flat=True)

    failed_tests = []
    missing_tests =[]

    for test_number in expected_readings:
        if test_number in readings:
            current_test = VOLTAGE_LEVELS[test_number]
            reported_v = KlufeVoltageReading.objects.filter(klufe_cal=klufe_cal.pk,
                                                            index=test_number)[0].reported_voltage
            if reported_v > current_test['upper'] or reported_v < current_test['lower']:
                failed_test = {
                    'index':test_number,
                    'source_voltage':current_test['source_voltage'],
                    'description':current_test['description'],
                    'reported_voltage':reported_v
                }
                failed_tests.append(failed_test)
        else:
            missing_tests.append(VOLTAGE_LEVELS[test_number])

    valid = len(missing_tests) == 0 and len(failed_tests) == 0
    error = {
        "valid":valid,
        "missing_tests":missing_tests,
        "failed_tests":failed_tests
    }

    return error


def get_upload_page_response(objects, request, serializerType, nextPage, previousPage, originalCount):
    # reusable pagination function
    if 'get_all' in request.GET:
        serializer = serializerType(objects, context={'request': request}, many=True)
        return Response({'data': serializer.data, 'count': originalCount}, status=status.HTTP_200_OK)

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

    return Response({'data': serializer.data, 'count': originalCount, 'numpages': paginator.num_pages,
                     'currentpage': page, 'nextpage': nextPage, 'previouspage': previousPage})
