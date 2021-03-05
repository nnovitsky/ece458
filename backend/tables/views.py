import os

from django.contrib.auth.models import User
from django.http import FileResponse
from django.http.request import QueryDict
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from backend.tables.models import ItemModel, Instrument, CalibrationEvent, UserType
from backend.tables.serializers import *
from backend.tables.utils import get_page_response, validate_user, get_calibration_modes
from backend.tables.filters import *
from backend.import_export import export_csv, export_pdf
from backend.import_export import validate_model_import, validate_instrument_import
from backend.import_export import write_import_models, write_import_instruments
from backend.config.export_flags import MODEL_EXPORT, INSTRUMENT_EXPORT, ZIP_EXPORT
from backend.config.admin_config import ADMIN_USERNAME
from backend.config.load_bank_config import CALIBRATION_MODES
from backend.tables.oauth import get_token, parse_id_token, get_user_details, login_oauth_user
from backend.hpt.settings import MEDIA_ROOT


class OauthConsume(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        code = request.GET['code']
        try:
            auth_token = get_token(code)
            user_details = get_user_details(auth_token)
            id_token = parse_id_token(auth_token)
            return login_oauth_user(id_token, user_details)
        except KeyError:
            return Response({"oauth_error": ["OAuth login failed."]}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def vendor_list(request):
    """
    List all vendors in DB.
    """
    vendors = set()
    for item_model in ItemModel.objects.all():
        vendors.add(item_model.vendor)
    return Response({'vendors': vendors}, status=status.HTTP_200_OK)


@api_view(['GET'])
def model_by_vendor_list(request, vendor):
    """
    List model number and pk for all models by a given vendor.
    """
    item_models = ItemModel.objects.filter(vendor=vendor)
    serializer = ItemModelByVendorSerializer(item_models, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


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
        return get_page_response(calibration_events, request, CalibrationEventReadSerializer, nextPage, previousPage)

    elif request.method == 'POST':
        # set user to current user
        request_data = request.data.dict() if type(request.data) == QueryDict else request.data
        if 'file' not in request_data or request_data['file'] == '':
            request_data['file'] = None
        request_data['file_type'] = 'None' if request_data['file'] is None else 'Artifact'

        request_data['user'] = request.user.pk
        # add new calibration event using instrument and user
        serializer = CalibrationEventWriteSerializer(data=request_data)
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
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
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
        if 'date' not in request.data: request.data['date'] = calibration_event.date

        serializer = CalibrationEventWriteSerializer(calibration_event, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        calibration_event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def calibration_event_file(request, pk):
    """
    Gets the corresponding file artifact from a cal event specified by its primary key.
    """
    try:
        calibration_event = CalibrationEvent.objects.get(pk=pk)
    except CalibrationEvent.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if calibration_event.file is None:
        return Response({"description": ["Calibration event does not have a associated file"]},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        file_path = MEDIA_ROOT + str(calibration_event.file)
        if not os.path.exists(file_path):
            return Response(status=status.HTTP_404_NOT_FOUND)
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=str(calibration_event.file))
    except IOError:
        return Response(status=status.HTTP_418_IM_A_TEAPOT)


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
        return get_page_response(instruments, request, ListInstrumentReadSerializer, nextPage, previousPage)

    elif request.method == 'POST':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
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
        serializer = ListInstrumentReadSerializer(instrument, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        # disable changing instrument's model
        request.data['item_model'] = instrument.item_model.pk
        if 'instrumentcategory_set' not in request.data: request.data['instrumentcategory_set'] = [cat.pk for cat in instrument.instrumentcategory_set.all()]
        if 'asset_tag' not in request.data: request.data['asset_tag'] = instrument.asset_tag
        serializer = InstrumentWriteSerializer(instrument, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
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
        return get_page_response(models, request, ItemModelReadSerializer, nextPage, previousPage)

    elif request.method == 'POST':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        mode_pks, error = get_calibration_modes(request)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        request.data['calibrationmode_set'] = mode_pks

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
        serializer = ItemModelReadSerializer(model, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        if 'vendor' not in request.data: request.data['vendor'] = model.vendor
        if 'model_number' not in request.data: request.data['model_number'] = model.model_number
        if 'description' not in request.data: request.data['description'] = model.description
        if 'itemmodelcategory_set' not in request.data: request.data['itemmodelcategory_set'] = [cat.pk for cat in model.itemmodelcategory_set.all()]
        mode_pks, error = get_calibration_modes(request)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)
        request.data['calibrationmode_set'] = mode_pks

        serializer = ItemModelSerializer(model, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        if len(model.instrument_set.all()) > 0:
            return Response(
                {"delete_error": ["Cannot delete model with instrument instances."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def get_calibration_modes(request):
    return Response({"modes": CALIBRATION_MODES}, status=status.HTTP_200_OK)


# IMPORT/EXPORT
@api_view(['GET'])
def export_calibration_event_pdf(request, pk):
    """
    Generates a pdf that contains the basic information of the instrument at hand
    (vendor, model #, description, and serial #) as well as the most recent calibration
    event (date of latest calibration, expiration date, user, comment)
    """
    try:
        instrument = Instrument.objects.get(pk=pk)
    except Instrument.DoesNotExist:
        return Response({"description": ["Instrument does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    if instrument.item_model.calibration_frequency <= 0:
        return Response({"description": ["Instrument can not be calibrated."]}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ListInstrumentReadSerializer(instrument)
    if len(serializer.data['calibration_event']) == 0:
        return Response({"description": ["Instrument has no associated calibration events"]},
                        status=status.HTTP_400_BAD_REQUEST)

    return export_pdf.handler(instrument)


@api_view(['PUT'])
def import_models_csv(request):
    """
    Imports a .csv file that contains model information based on requirements
    and uploads the data to the db.
    """
    if not UserType.contains_user(request.user, "admin"):
        return Response({"permission_error": ["User does not have permission."]},
                        status=status.HTTP_401_UNAUTHORIZED)

    try:
        uploaded_file = request.FILES['FILE']
    except KeyError:
        return Response({"Upload error": ["No file was uploaded."]},
                        status=status.HTTP_409_CONFLICT)
    if uploaded_file.content_type not in ['text/csv', 'application/vnd.ms-excel']:
        return Response({"Upload error": ["Incorrect file type uploaded. Must be CSV."]},
                        status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    correct_format, format_response = validate_model_import.handler(uploaded_file)
    if not correct_format:
        return Response({"Upload error": [f"{format_response}"]},
                        status=status.HTTP_412_PRECONDITION_FAILED)

    db_write_success, upload_list, upload_summary = write_import_models.handler(uploaded_file)

    if not db_write_success:
        return Response({"Upload error": [f"DB write error: {upload_summary}"]},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        nextPage = 1
        previousPage = 1
        return get_page_response(upload_list, request, ItemModelSerializer, nextPage, previousPage)


@api_view(['PUT'])
def import_instruments_csv(request):
    """
    Imports a .csv file that contains instrument information based on requirements
    and uploads the data to the db.
    """
    if not UserType.contains_user(request.user, "admin"):
        return Response({"permission_error": ["User does not have permission."]},
                        status=status.HTTP_401_UNAUTHORIZED)

    try:
        uploaded_file = request.FILES['FILE']
    except KeyError:
        return Response({"Upload error": ["No file was uploaded."]},
                        status=status.HTTP_409_CONFLICT)

    if uploaded_file.content_type not in ['text/csv', 'application/vnd.ms-excel']:
        return Response({"Upload error": ["Incorrect file type uploaded. Must be CSV."]},
                        status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    correct_format, format_response = validate_instrument_import.handler(uploaded_file)
    if not correct_format:
        return Response({"Upload error": [f"{format_response}"]},
                        status=status.HTTP_412_PRECONDITION_FAILED)

    db_write_success, upload_list, upload_summary = write_import_instruments.handler(uploaded_file, request)

    if not db_write_success:
        return Response({"Upload error": [f"DB write error: {upload_summary}"]},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        nextPage = 1
        previousPage = 1
        return get_page_response(upload_list, request, ListInstrumentReadSerializer, nextPage, previousPage)


@api_view(['GET'])
def get_example_model_csv(request):
    """
    Returns the sample csv file for how model imports should be formatted.
    """
    path = "import_export/sample_csv/"
    file_name = "example_model_upload.csv"

    try:
        return FileResponse(open(path + file_name, 'rb'), as_attachment=True, filename=file_name)
    except IOError:
        return Response({"description": ["File requested not found."]}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_example_instrument_csv(request):
    """
    Returns the sample csv file for how instrument imports should be formatted.
    """
    path = "import_export/sample_csv/"
    file_name = "example_instrument_upload.csv"

    try:
        return FileResponse(open(path + file_name, 'rb'), as_attachment=True, filename=file_name)
    except IOError:
        return Response({"description": ["File requested not found."]}, status=status.HTTP_404_NOT_FOUND)


# USERS
class TokenAuth(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        error = Response("Unable to login with provided credentials", status=status.HTTP_400_BAD_REQUEST)
        if 'username' not in request.data: return error
        try:
            user = User.objects.get(username=request.data['username'])
            if not user.is_active or UserType.contains_user(user, "oauth"):
                return error
        except User.DoesNotExist:
            return error
        serializer = UserTokenSerializer(user, data=request.data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return error


@api_view(['PUT', 'DELETE'])
def toggle_admin(request, user_pk):
    try:
        admin_group = UserType.objects.get(name="admin")
    except UserType.DoesNotExist:
        admin_group = UserType(name="admin").save()

    if not UserType.contains_user(request.user, "admin"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        other_user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return Response({"description": ["User does not exist."]}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        if not UserType.contains_user(other_user, "admin"):
            admin_group.users.add(other_user)
        serializer = UserSerializer(other_user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        if other_user.username == ADMIN_USERNAME:
            return Response({"description": ["Cannot revoke this user's admin privileges."]}, status=status.HTTP_400_BAD_REQUEST)
        if UserType.contains_user(other_user, "admin"):
            admin_group.users.remove(other_user)
        serializer = UserSerializer(other_user)
        return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET', 'PUT'])
def current_user(request):
    """
    Determine the current user by their token, and return their data or update their profile.
    Returns 200 on successful GET or PUT.
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        error_check = validate_user(request, create=False)
        if error_check: return error_check
        if 'username' not in request.data: request.data['username'] = request.user.username
        if 'password' in request.data:
            pw = request.data.pop('password')
            request.user.set_password(pw)
            request.user.save()
        serializer = UserEditSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
def user_list(request):
    """
    Get list of all users or delete user. Returns 200 on success.
    """
    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        users = User.objects.all().filter(is_active=True)
        return get_page_response(users, request, UserSerializer, nextPage, previousPage)

    elif request.method == 'DELETE':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            delete_user = User.objects.get(pk=request.data['delete_user'])
        except User.DoesNotExist:
            return Response({"user_error": ["Invalid user ID."]}, status=status.HTTP_404_NOT_FOUND)
        if delete_user.pk == request.user.pk:
            return Response({"user_error": ["Cannot delete self."]}, status=status.HTTP_400_BAD_REQUEST)
        if UserType.contains_user(delete_user, "oauth"):
            return Response({"user_error": ["Cannot delete oauth user."]}, status=status.HTTP_400_BAD_REQUEST)
        delete_user.is_active = False
        delete_user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserCreate(APIView):
    """
    Create a new user.
    """
    # allows us to change permissions on who can create a user
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        error_check = validate_user(request, create=True)
        if error_check: return error_check
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# CATEGORIES
@api_view(['GET', 'POST'])
def model_category_list(request):

    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        categories = ItemModelCategory.objects.all()
        return get_page_response(categories, request, ListItemModelCategorySerializer, nextPage, previousPage)

    elif request.method == 'POST':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = ItemModelCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def instrument_category_list(request):

    if request.method == 'GET':
        nextPage = 1
        previousPage = 1
        categories = InstrumentCategory.objects.all()
        return get_page_response(categories, request, ListInstrumentCategorySerializer, nextPage, previousPage)

    elif request.method == 'POST':
        if not UserType.contains_user(request.user, "admin"):
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = InstrumentCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
def model_category_detail(request, pk):
    """
    Update or delete a category by pk.
    Returns 404 if category does not exist, 200 on successful PUT, 400 on bad PUT request data,
    204 on successful DELETE.
    """
    try:
        category = ItemModelCategory.objects.get(pk=pk)
    except ItemModelCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if not UserType.contains_user(request.user, "admin"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'PUT':
        if 'name' not in request.data: request.data['name'] = category.name
        if 'item_models' in request.data: request.data.pop('item_models')
        serializer = ItemModelCategorySerializer(category, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if len(category.item_models.all()) > 0 and ('force_delete' not in request.data or not request.data['force_delete']):
            return Response(
                {"delete_error": ["Category is not empty."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT', 'DELETE'])
def instrument_category_detail(request, pk):
    """
    Update or delete a category by pk.
    Returns 404 if category does not exist, 200 on successful PUT, 400 on bad PUT request data,
    204 on successful DELETE.
    """
    try:
        category = InstrumentCategory.objects.get(pk=pk)
    except InstrumentCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if not UserType.contains_user(request.user, "admin"):
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'PUT':
        if 'name' not in request.data: request.data['name'] = category.name
        if 'instruments' in request.data: request.data.pop('instruments')
        serializer = InstrumentCategorySerializer(category, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if len(category.instruments.all()) > 0 and ('force_delete' not in request.data or not request.data['force_delete']):
            return Response(
                {"delete_error": ["Cannot delete non-empty category."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def category_list(request, type):
    if type == 'instrument':
        categories = InstrumentCategory.objects.all()
    elif type == 'item_model':
        categories = ItemModelCategory.objects.all()
    else:
        return Response({"category_error": ["Invalid category type."]}, status=status.HTTP_400_BAD_REQUEST)

    data = [{'name': cat.name, 'pk': cat.pk} for cat in categories]
    return Response(data, status=status.HTTP_200_OK)