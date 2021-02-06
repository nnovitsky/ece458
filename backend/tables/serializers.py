from rest_framework import serializers
from backend.tables.models import ItemModel, Instrument, CalibrationEvent
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'first_name')


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
        fields = ('token', 'username', 'password')


class ItemModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency')


class InstrumentReadSerializer(serializers.ModelSerializer):
    item_model = ItemModelSerializer()

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'vendor', 'model_number', 'serial_number', 'comment')


class InstrumentWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'vendor', 'model_number', 'serial_number', 'comment')


class CalibrationEventReadSerializer(serializers.ModelSerializer):
    instrument = InstrumentReadSerializer()
    user = UserSerializer()

    class Meta:
        model = CalibrationEvent
        fields = ('date', 'user', 'instrument')


class CalibrationEventWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalibrationEvent
        fields = ('date', 'user', 'instrument')
