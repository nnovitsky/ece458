from rest_framework import serializers
from backend.tables.models import ItemModel, Instrument
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User


class ItemModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency')


class InstrumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Instrument
        fields = ('pk', 'model', 'vendor', 'model_number', 'serial_number', 'comment')


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
