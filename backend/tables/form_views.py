from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from backend.tables.models import *
from backend.tables.serializers import *
from backend.config.form_config import *


@api_view(['GET', 'POST'])
def form_data(request, model_pk):
    try:
        itemmodel = ItemModel.objects.get(pk=model_pk)
    except ItemModel.DoesNotExist:
        return Response({"form_error": ["Item model does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        form_fields = itemmodel.calibrationformfield_set.order_by('index')
        if len(form_fields) == 0:
            return Response({"form_error": ["Item model does not have a custom form."]}, status=status.HTTP_404_NOT_FOUND)
        serializer = FormFieldSerializer(form_fields, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if not UserType.contains_user(request.user, "models"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        if "custom_form" not in itemmodel.calibrationmode_set.values_list("name", flat=True):
            return Response({"form_error": ["Item model does not allow custom forms."]}, status=status.HTTP_404_NOT_FOUND)
        # validate fields
        errors = validate_new_form(request.data['fields'], model_pk)
        if len(errors) > 0:
            return Response({"form_error": errors}, status=status.HTTP_400_BAD_REQUEST)

        fields = sorted(request.data['fields'], key=lambda i: i['index'])
        # delete previous form if exists
        if len(itemmodel.calibrationformfield_set.all()):
            itemmodel.calibrationformfield_set.all().delete()
        serializer = FormFieldSerializer(data=fields, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def submit_form(request, cal_event_pk):
    try:
        cal_event = CalibrationEvent.objects.get(pk=cal_event_pk)
    except CalibrationEvent.DoesNotExist:
        return Response({"form_error": ["Calibration event not found."]}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        if not UserType.contains_user(request.user, "calibrations"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

        itemmodel = cal_event.instrument.item_model
        if "custom_form" not in itemmodel.calibrationmode_set.values_list("name", flat=True):
            return Response({"form_error": ["Item model does not allow custom forms."]}, status=status.HTTP_400_BAD_REQUEST)
        if len(itemmodel.calibrationformfield_set.all() == 0):
            return Response({"form_error": ["Item model does not have a custom form."]}, status=status.HTTP_400_BAD_REQUEST)

        if len(cal_event.calibrationformfield_set.all()) > 0:
            return Response({"form_error": ["Calibration event already has form associated."]}, status=status.HTTP_400_BAD_REQUEST)

        errors = validate_form_submit(request.data['fields'], cal_event_pk)
        if len(errors) > 0:
            return Response({"form_error": errors}, status=status.HTTP_400_BAD_REQUEST)
        fields = sorted(request.data['fields'], key=lambda i: i['index'])
        serializer = FormFieldSerializer(data=fields, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        cal_form = cal_event.calibrationformfield_set.order_by('index')
        if len(cal_form) == 0:
            return Response({"form_error": ["Calibration event has no associated form."]}, status=status.HTTP_400_BAD_REQUEST)
        cal_event_serializer = CalibrationEventReadSerializer(cal_event)
        form_serializer = FormFieldSerializer(cal_form, many=True)
        return Response({'cal_event': cal_event_serializer.data, 'fields': form_serializer.data}, status=status.HTTP_200_OK)


def validate_new_form(fields, model_pk):
    errors = []
    for field in fields:
        field['itemmodel'] = model_pk
        field['cal_event'] = None
        if 'index' not in field or 'fieldtype' not in field:
            errors.append({'error': "Index and fieldtype are required for all fields."})
            continue
        if field['fieldtype'] not in FORM_FIELDS.values():
            errors.append({'index': field['index'], 'error': "Invalid field type."})
            continue

        expected_fields = EXPECTED_FIELDS[field['fieldtype']]
        unexpected_fields = ALL_FIELDS - expected_fields
        missing = []
        for name in expected_fields:
            if name not in field or field[name] is None or field[name] == "":
                missing.append(name)
        for name in unexpected_fields:
            if name in field: field[name] = None
        if len(missing) > 0:
            errors.append({'index': field['index'], 'error': "Missing required fields for this fieldtype.", 'missing': missing})
            continue

        if field['fieldtype'] == FORM_FIELDS['float_input'] and field['expected_min'] > field['expected_max']:
            errors.append({'index': field['index'], 'error': "Min cannot be greater than max."})
    return errors


def validate_form_submit(fields, cal_event_pk):
    errors = []
    for field in fields:
        field['cal_event'] = cal_event_pk
        field['itemmodel'] = None
        if 'index' not in field or 'fieldtype' not in field:
            errors.append({'error': "Index and fieldtype are required for all fields."})
            continue

        if field['fieldtype'] == FORM_FIELDS['header'] or field['fieldtype'] == FORM_FIELDS['plaintext'] or field['fieldtype'] == FORM_FIELDS['text_input']:
            field['value_okay'] = True
        elif field['fieldtype'] == FORM_FIELDS['bool_input']:
            try:
                actual_bool = field['actual_bool']
                if not actual_bool:
                    errors.append({'index': field['index'], 'error': "Value must be true."})
                else:
                    field['value_okay'] = True
            except KeyError:
                errors.append({'index': field['index'], 'error': "Actual boolean not provided."})
        elif field['fieldtype'] == FORM_FIELDS['float_input']:
            try:
                val = field['actual_float']
                if (field['expected_min'] and val < field['expected_min']) or (field['expected_max'] and val > field['expected_max']):
                    errors.append({'index': field['index'], 'error': "Value is outside acceptable range."})
                else:
                    field['value_okay'] = True
            except KeyError:
                errors.append({'index': field['index'], 'error': "Actual float not provided."})
        else:
            errors.append({'index': field['index'], 'error': "Invalid field type."})
    return errors
