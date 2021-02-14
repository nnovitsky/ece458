import json
from rest_framework import status
from django.test import TestCase
from django.urls import reverse
from backend.tables.models import *
from backend.tables.serializers import *
from backend.tables.utils import setUpTestAuth


"""
tests: 
- create item model
- get all models
- get single model
- edit item model
- delete item model
- get vendor list
- get model num by vendor list
#TODO: add non happy path tests
"""


class ItemModelTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        setUpTestAuth(cls)
        # clear instruments first so we can delete models
        Instrument.objects.all().delete()
        ItemModel.objects.all().delete()
        ItemModel(vendor='v1', model_number='m1', description='desc', calibration_frequency=360).save()
        ItemModel(vendor='v1', model_number='m2', description='desc', calibration_frequency=0).save()
        ItemModel(vendor='v2', model_number='m1', description='desc', calibration_frequency=400).save()
        cls.model_data = {
            "vendor": "v1",
            "model_number": "m3",
            "description": "a test model",
            "comment": "my comment",
            "calibration_frequency": 180
        }

    def test_model_create_auth(self):
        response = self.client.post(reverse('models_list'), data=json.dumps(self.model_data),
                                    content_type='application/json',
                                    HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_model_list(self):
        response = self.client.get(reverse('models_list'), {'get_all': 'true'}, HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        models = ItemModel.objects.all()
        serializer = ItemModelSerializer(models, many=True)
        self.assertEqual(serializer.data, response.data['data'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_model(self):
        pk = 1
        response = self.client.get(reverse('model_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        model = ItemModel.objects.get(pk=pk)
        serializer = DetailItemModelSerializer(model)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_model_edit_auth(self):
        pk = 1
        self.model_data['description'] = "testing new description"
        response = self.client.put(reverse('model_detail', args=[pk]), data=json.dumps(self.model_data),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        model = ItemModel.objects.get(pk=pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(model.description, response.data['description'])

    def test_model_delete_auth(self):
        pk = 2
        response = self.client.delete(reverse('model_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_vendor_list_auth(self):
        vendors = set()
        for item_model in ItemModel.objects.all():
            vendors.add(item_model.vendor)
        response = self.client.get(reverse('vendor_list'), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.data['vendors'], vendors)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_model_num_by_vendor_auth(self):
        vendor = 'v1'
        models = ItemModel.objects.filter(vendor=vendor)
        serializer = ItemModelByVendorSerializer(models, many=True)
        response = self.client.get(reverse('models_by_vendor', args=[vendor]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_item_model_filter_vendor(self):
        vendor = 'v1'
        response = self.client.get(reverse('model_search'), {'vendor': vendor, 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        models = ItemModel.objects.filter(vendor=vendor)
        serializer = ItemModelSerializer(models, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data['data'])

    def test_item_model_sort_model_num(self):
        response = self.client.get(reverse('model_search'), {'sort_by': '-model_number_lower', 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        models = ItemModel.objects.order_by('-model_number')
        serializer = ItemModelSerializer(models, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data['data'])
