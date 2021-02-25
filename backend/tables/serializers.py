from rest_framework import serializers
from backend.tables.models import *
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User
import datetime


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_staff')


class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'username', 'password', 'first_name', 'last_name', 'email')


class UserEditSerializer(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    class Meta:
        model = User
        fields = ('token', 'username', 'first_name', 'last_name', 'email')


class ItemModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency')


class ItemModelByVendorSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'model_number')


class ListInstrumentReadSerializer(serializers.ModelSerializer):
    # use when serializing instrument to include most recent calibration event
    item_model = ItemModelSerializer()
    calibration_event = serializers.SerializerMethodField('_get_most_recent_calibration')
    calibration_expiration = serializers.SerializerMethodField('_get_calibration_expiration')

    def _get_most_recent_calibration(self, obj):
        cal_event = obj.calibrationevent_set.order_by('-date')[:1]
        serializer = CalibrationEventWriteSerializer(cal_event, many=True)
        return serializer.data

    def _get_calibration_expiration(self, obj):
        cal_frequency = obj.item_model.calibration_frequency
        if cal_frequency < 1:
            return "Uncalibratable."
        last_cal = obj.calibrationevent_set.order_by('-date')[:1]
        if len(last_cal) < 1:
            return "Instrument not calibrated."
        else:
            last_cal = last_cal[0]
            exp_date = last_cal.date + datetime.timedelta(cal_frequency)
            return exp_date

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'calibration_event', 'calibration_expiration')


class DetailInstrumentReadSerializer(serializers.ModelSerializer):
    # use when viewing detail page for instrument
    item_model = ItemModelSerializer()
    calibration_events = serializers.SerializerMethodField('_get_all_calibrations')
    calibration_expiration = serializers.SerializerMethodField('_get_calibration_expiration')

    def _get_all_calibrations(self, obj):
        cal_events = obj.calibrationevent_set.order_by('-date')
        serializer = SimpleCalibrationEventReadSerializer(cal_events, many=True)
        return serializer.data

    def _get_calibration_expiration(self, obj):
        cal_frequency = obj.item_model.calibration_frequency
        if cal_frequency < 1:
            return "Uncalibratable."
        last_cal = obj.calibrationevent_set.order_by('-date')[:1]
        if len(last_cal) < 1:
            return "Instrument not calibrated."
        else:
            last_cal = last_cal[0]
            exp_date = last_cal.date + datetime.timedelta(cal_frequency)
            return exp_date

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'calibration_expiration', 'calibration_events')


class SimpleInstrumentReadSerializer(serializers.ModelSerializer):
    # use when serializing calibration event to avoid redundant data
    item_model = ItemModelSerializer()

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment')


class InstrumentWriteSerializer(serializers.ModelSerializer):
    # use when writing instrument with serializer
    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment')


class CalibrationEventReadSerializer(serializers.ModelSerializer):
    # use when reading calibration event with serializer
    instrument = SimpleInstrumentReadSerializer()
    user = UserSerializer()

    class Meta:
        model = CalibrationEvent
        fields = ('pk', 'date', 'user', 'instrument', 'comment')


class SimpleCalibrationEventReadSerializer(serializers.ModelSerializer):
    # use when reading instrument details
    user = UserSerializer()

    class Meta:
        model = CalibrationEvent
        fields = ('pk', 'date', 'user', 'comment')


class CalibrationEventWriteSerializer(serializers.ModelSerializer):
    # use when writing calibration event with serializer or reading most recent calibration event for instrument
    class Meta:
        model = CalibrationEvent
        fields = ('pk', 'date', 'user', 'instrument', 'comment')

    def validate(self, data):
        if data['date'] > datetime.date.today():
            raise serializers.ValidationError("Cannot set future date.")
        item_model = data['instrument'].item_model
        if item_model.calibration_frequency <= 0:
            raise serializers.ValidationError("Non-calibratable instrument.")
        return data


class ItemModelCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModelCategory
        fields = ('pk', 'name', 'item_models')


class ListItemModelCategorySerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()

    def get_count(self, obj):
        return len(obj.item_models.all())

    class Meta:
        model = ItemModelCategory
        fields = ('pk', 'name', 'count', 'item_models')


class InstrumentCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = InstrumentCategory
        fields = ('pk', 'name', 'instruments')


class ListInstrumentCategorySerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()

    def get_count(self, obj):
        return len(obj.instruments.all())

    class Meta:
        model = InstrumentCategory
        fields = ('pk', 'name', 'count', 'instruments')