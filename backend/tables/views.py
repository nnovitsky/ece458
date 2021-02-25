from django.contrib.auth.models import User
from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView

from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from backend.tables.serializers import *
from backend.tables.utils import get_page_response, validate_user
from backend.tables.filters import *
from backend.import_export import export_csv, export_pdf
from backend.import_export import validate_model_import, validate_instrument_import
from backend.import_export import write_import_models, write_import_instruments
from backend.config.export_flags import MODEL_EXPORT, INSTRUMENT_EXPORT, ZIP_EXPORT


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
        request.data['user'] = request.user.pk
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
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if not request.user.is_staff:
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
        if not request.user.is_staff:
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
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
        return get_page_response(instruments, request, ListInstrumentReadSerializer, nextPage, previousPage)

    elif request.method == 'POST':
        if not request.user.is_staff:
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
        if not request.user.is_staff:
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        # disable changing instrument's model
        request.data['item_model'] = instrument.item_model.pk
        request.data['instrumentcategory_set'] = [cat.pk for cat in instrument.instrumentcategory_set.all()]
        if 'serial_number' not in request.data: request.data['serial_number'] = instrument.serial_number
        serializer = InstrumentWriteSerializer(instrument, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:
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
        if not request.user.is_staff:
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
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
        if not request.user.is_staff:
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        if 'vendor' not in request.data: request.data['vendor'] = model.vendor
        if 'model_number' not in request.data: request.data['model_number'] = model.model_number
        if 'description' not in request.data: request.data['description'] = model.description
        request.data['itemmodelcategory_set'] = [cat.pk for cat in model.itemmodelcategory_set.all()]
        serializer = ItemModelSerializer(model, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:
            return Response(
                {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)
        if len(model.instrument_set.all()) > 0:
            return Response(
                {"delete_error": ["Cannot delete model with instrument instances."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


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
    if not request.user.is_staff:
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
        return Response({"description": [f"{format_response}", upload_summary], "upload_list": upload_list},
                        status=status.HTTP_200_OK)


@api_view(['PUT'])
def import_instruments_csv(request):
    """
    Imports a .csv file that contains instrument information based on requirements
    and uploads the data to the db.
    """
    if not request.user.is_staff:
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
        return Response({"description": [f"{format_response}", upload_summary], "upload_list": upload_list},
                        status=status.HTTP_200_OK)


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


@api_view(['GET'])
def user_list(request):
    """
    Get list of all users. Returns 200 on success.
    """
    nextPage = 1
    previousPage = 1
    users = User.objects.all()
    return get_page_response(users, request, UserSerializer, nextPage, previousPage)


class UserCreate(APIView):
    """
    Create a new user.
    """
    # allows us to change permissions on who can create a user
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        if not request.user.is_staff:
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
        if not request.user.is_staff:
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
        if not request.user.is_staff:
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
    if not request.user.is_staff:
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
        if len(category.item_models.all()) > 0:
            return Response(
                {"delete_error": ["Cannot delete non-empty category."]}, status=status.HTTP_400_BAD_REQUEST)
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
    if not request.user.is_staff:
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
        if len(category.instruments.all()) > 0:
            return Response(
                {"delete_error": ["Cannot delete non-empty category."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT', 'DELETE'])
def edit_model_categories(request, pk):
    try:
        model = ItemModel.objects.get(pk=pk)
    except ItemModel.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_staff:
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    if 'categories' not in request.data:
        return Response({"category_error": ["Categories are required."]}, status=status.HTTP_400_BAD_REQUEST)

    cat_pks = request.data['categories']
    try:
        categories = [ItemModelCategory.objects.get(pk=cat_pk) for cat_pk in cat_pks]
    except ItemModelCategory.DoesNotExist:
        return Response({"category_error": ["Invalid category key."]}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PUT':
        for cat in categories:
            if model in cat.item_models.all(): continue
            cat.item_models.add(model)
        serializer = ItemModelReadSerializer(model)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        for cat in categories:
            if model not in cat.item_models.all(): continue
            cat.item_models.remove(model)
        serializer = ItemModelReadSerializer(model)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'DELETE'])
def edit_instrument_categories(request, pk):
    try:
        instrument = Instrument.objects.get(pk=pk)
    except Instrument.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_staff:
        return Response(
            {"permission_error": ["User does not have permission."]}, status=status.HTTP_401_UNAUTHORIZED)

    if 'categories' not in request.data:
        return Response({"category_error": ["Categories are required."]}, status=status.HTTP_400_BAD_REQUEST)

    cat_pks = request.data['categories']
    try:
        categories = [InstrumentCategory.objects.get(pk=cat_pk) for cat_pk in cat_pks]
    except InstrumentCategory.DoesNotExist:
        return Response({"category_error": ["Invalid category key."]}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PUT':
        for cat in categories:
            if instrument in cat.instruments.all(): continue
            cat.instruments.add(instrument)
        serializer = InstrumentWriteSerializer(instrument)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        for cat in categories:
            if instrument not in cat.instruments.all(): continue
            cat.instruments.remove(instrument)
        serializer = InstrumentWriteSerializer(instrument)
        return Response(serializer.data, status=status.HTTP_200_OK)


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