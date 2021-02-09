from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, permissions
from rest_framework.views import APIView
from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from django.contrib.auth.models import User
from backend.tables.serializers import *
from backend.tables.utils import get_page_response
from backend.tables.filters import *


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
        return get_page_response(calibration_events, request, CalibrationEventReadSerializer, "calibration_events", nextPage, previousPage)

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
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
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
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
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
        return get_page_response(instruments, request, ListInstrumentReadSerializer, "instruments", nextPage, previousPage)

    elif request.method == 'POST':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
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
        serializer = DetailInstrumentReadSerializer(instrument, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
        if 'item_model' not in request.data:
            request.data['item_model'] = instrument.item_model.pk
        if 'serial_number' not in request.data: request.data['serial_number'] = instrument.serial_number
        serializer = InstrumentWriteSerializer(instrument, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
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
        return get_page_response(models, request, ItemModelSerializer, "models", nextPage, previousPage)

    elif request.method == 'POST':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
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
        serializer = DetailItemModelSerializer(model, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
        if 'vendor' not in request.data: request.data['vendor'] = model.vendor
        if 'model_number' not in request.data: request.data['model_number'] = model.model_number
        serializer = ItemModelSerializer(model, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not request.user.is_staff:
            return Response("User does not have permission.", status=status.HTTP_401_UNAUTHORIZED)
        if len(model.instrument_set.all()) > 0:
            return Response("Cannot delete model with instrument instances.", status=status.HTTP_400_BAD_REQUEST)
        else:
            model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


# USERS
@api_view(['GET', 'PUT'])
def current_user(request):
    """
    Determine the current user by their token, and return their data or update their profile.
    Returns 200 on successful GET or PUT.
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if 'username' not in request.data: request.data['username'] = request.user.username
        if 'password' in request.data:
            pw = request.data.pop('password')
            request.user.set_password(pw)
            request.user.save()
        serializer = UserEditSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_list(request):
    """
    Get list of all users. Returns 200 on success.
    """
    nextPage = 1
    previousPage = 1
    users = User.objects.all()
    return get_page_response(users, request, UserSerializer, "users", nextPage, previousPage)


class UserCreate(APIView):
    """
    Create a new user.
    """
    # allows us to change permissions on who can create a user
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
