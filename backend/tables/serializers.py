from rest_framework import serializers
from backend.tables.models import *
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User
import datetime
from backend.config.load_bank_config import *


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField('_get_groups')

    def _get_groups(self, obj):
        grps = [utype.name for utype in obj.usertype_set.all()]
        return grps

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email', 'groups')


class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)
    groups = serializers.SerializerMethodField('_add_to_groups')

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def _add_to_groups(self, obj):
        if 'groups' not in self.initial_data: return []
        for groupname in self.initial_data['groups']:
            if UserType.contains_user(obj, groupname):
                continue
            try:
                group = UserType.objects.get(name=groupname)
            except UserType.DoesNotExist:
                group = UserType(name=groupname)
                group.save()
            group.users.add(obj)
        return self.initial_data['groups']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'username', 'password', 'first_name', 'last_name', 'email', 'groups')


class UserEditSerializer(serializers.ModelSerializer):

    token = serializers.SerializerMethodField('_get_token')
    groups = serializers.SerializerMethodField('_add_to_groups')

    def _get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def _add_to_groups(self, obj):
        if 'groups' not in self.initial_data: return []
        for groupname in self.initial_data['groups']:
            if UserType.contains_user(obj, groupname):
                continue
            try:
                group = UserType.objects.get(name=groupname)
            except UserType.DoesNotExist:
                group = UserType(name=groupname)
                group.save()
            group.users.add(obj)
        return self.initial_data['groups']

    class Meta:
        model = User
        fields = ('token', 'username', 'first_name', 'last_name', 'email', 'groups')


class UserTokenSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField('_get_token')
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    user = serializers.SerializerMethodField('_get_user_data')

    def _get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def _get_user_data(self, obj):
        serializer = UserSerializer(obj)
        return serializer.data

    class Meta:
        model = User
        fields = ('token', 'username', 'password', 'user')


class ItemModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency', 'itemmodelcategory_set')


class ItemModelNoCategoriesSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency')


class ItemModelSearchSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        return {'item_model_categories': obj.model_cats}

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency', 'categories')


class ItemModelReadSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        cats = [{'name': cat.name, 'pk': cat.pk} for cat in obj.itemmodelcategory_set.all()]
        return cats

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency', 'categories')


class ItemModelByVendorSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'model_number')


class ListInstrumentReadSerializer(serializers.ModelSerializer):
    # use when serializing instrument to include most recent calibration event
    item_model = ItemModelNoCategoriesSerializer()
    calibration_event = serializers.SerializerMethodField('_get_most_recent_calibration')
    calibration_expiration = serializers.SerializerMethodField('_get_calibration_expiration')
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        instrument_cats = [{'name': cat.name, 'pk': cat.pk} for cat in obj.instrumentcategory_set.all()]
        model_cats = [{'name': cat.name, 'pk': cat.pk} for cat in obj.item_model.itemmodelcategory_set.all()]
        return {'item_model_categories': model_cats, 'instrument_categories': instrument_cats}

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
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'calibration_event', 'calibration_expiration', 'categories')


class InstrumentSearchSerializer(serializers.ModelSerializer):
    item_model = serializers.SerializerMethodField()
    calibration_event = serializers.SerializerMethodField()
    calibration_expiration = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        return {'item_model_categories': obj.model_cats, 'instrument_categories': obj.instrument_cats}

    def get_item_model(self, obj):
        return {
            "vendor": obj.vendor,
            "model_number": obj.model_number,
            "description": obj.description
        }

    def get_calibration_event(self, obj):
        if obj.cal_freq == 0: return []
        elif not obj.most_recent_calibration: return []
        return [{"date": obj.most_recent_calibration}]

    def get_calibration_expiration(self, obj):
        if obj.cal_freq == 0: return "Uncalibratable."
        elif not obj.most_recent_calibration: return "Instrument not calibrated."
        return obj.calibration_expiration_date

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'calibration_event', 'calibration_expiration', 'categories')


class DetailInstrumentReadSerializer(serializers.ModelSerializer):
    # use when viewing detail page for instrument
    item_model = ItemModelNoCategoriesSerializer()
    calibration_events = serializers.SerializerMethodField('_get_all_calibrations')
    calibration_expiration = serializers.SerializerMethodField('_get_calibration_expiration')
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        instrument_cats = [{'name': cat.name, 'pk': cat.pk} for cat in obj.instrumentcategory_set.all()]
        model_cats = [{'name': cat.name, 'pk': cat.pk} for cat in obj.item_model.itemmodelcategory_set.all()]
        return {'item_model_categories': model_cats, 'instrument_categories': instrument_cats}

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
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'calibration_expiration', 'calibration_events', 'categories')


class SimpleInstrumentReadSerializer(serializers.ModelSerializer):
    # use when serializing calibration event to avoid redundant data
    item_model = ItemModelNoCategoriesSerializer()

    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment')


class InstrumentWriteSerializer(serializers.ModelSerializer):
    # use when writing instrument with serializer
    class Meta:
        model = Instrument
        fields = ('pk', 'item_model', 'serial_number', 'comment', 'instrumentcategory_set')


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
    def validate(self, data):
        if " " in data['name']:
            raise serializers.ValidationError("Category name cannot have spaces.")
        return data

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
    def validate(self, data):
        if " " in data['name']:
            raise serializers.ValidationError("Category name cannot have spaces.")
        return data

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


class LBCalSerializer(serializers.ModelSerializer):

    class Meta:
        model = LoadBankCalibration
        fields = ('pk', 'cal_event', 'voltmeter', 'shunt_meter', 'visual_inspection', 'auto_cutoff', 'alarm', 'recorded_data', 'printer')


class LoadCurrentWriteSerializer(serializers.ModelSerializer):
    cr_error = serializers.SerializerMethodField()
    ca_error = serializers.SerializerMethodField()
    cr_ok = serializers.SerializerMethodField()
    ca_ok = serializers.SerializerMethodField()

    def get_cr_error(self, obj):
        if self.initial_data['ideal'] == 0: return None
        cr = self.initial_data['cr']
        ca = self.initial_data['ca']
        return (cr-ca)/ca

    def get_ca_error(self, obj):
        ideal = self.initial_data['ideal']
        if ideal == 0: return None
        ca = self.initial_data['ca']
        return (ca-ideal)/ideal

    def get_cr_ok(self, obj):
        if self.initial_data['ideal'] == 0:
            return self.initial_data['cr'] == 0
        cr_error = self.get_cr_error(obj)
        return abs(cr_error) < CR_THRESHOLD

    def get_ca_ok(self, obj):
        if self.initial_data['ideal'] == 0:
            return self.initial_data['ca'] == 0
        ca_error = self.get_ca_error(obj)
        return abs(ca_error) < CA_THRESHOLD

    class Meta:
        model = LoadCurrent
        fields = ('pk', 'lb_cal', 'load', 'cr', 'ca', 'ideal', 'cr_error', 'ca_error', 'index', 'cr_ok', 'ca_ok')


class LoadVoltageWriteSerializer(serializers.ModelSerializer):
    vr_error = serializers.SerializerMethodField()
    va_error = serializers.SerializerMethodField()
    vr_ok = serializers.SerializerMethodField()
    va_ok = serializers.SerializerMethodField()

    def get_vr_error(self, obj):
        vr = self.initial_data['vr']
        va = self.initial_data['va']
        return (vr-va)/va

    def get_va_error(self, obj):
        test = self.initial_data['test_voltage']
        va = self.initial_data['va']
        return (va-test)/test

    def get_vr_ok(self, obj):
        vr_error = self.get_vr_error(obj)
        return abs(vr_error) < VR_THRESHOLD

    def get_va_ok(self, obj):
        va_error = self.get_va_error(obj)
        return abs(va_error) < VA_THRESHOLD

    class Meta:
        model = LoadVoltage
        fields = ('pk', 'lb_cal', 'vr', 'va', 'test_voltage', 'vr_error', 'va_error', 'vr_ok', 'va_ok')
