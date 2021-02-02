from rest_framework import serializers
from .models import ItemModel


class ItemModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemModel
        fields = ('pk', 'vendor', 'model_number', 'description', 'comment', 'calibration_frequency')