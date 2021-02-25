import json
from rest_framework import status
from django.test import TestCase
from django.urls import reverse
from backend.tables.models import *
from backend.tables.serializers import *
from backend.tables.utils import setUpTestAuth


"""
tests:
- create instrument
- get all instruments
- get single instrument
- edit instrument
- delete instrument
#TODO: add non happy path tests
"""


class InstrumentTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        setUpTestAuth(cls)
        # clear instruments first so we can delete models
        Instrument.objects.all().delete()
        ItemModel.objects.all().delete()
        ItemModel(vendor='v1', model_number='m1', description='desc', calibration_frequency=360).save()
        ItemModel(vendor='v1', model_number='m2', description='desc', calibration_frequency=0).save()
        Instrument(item_model=ItemModel.objects.all()[0], serial_number='s1', comment="a comment").save()
        Instrument(item_model=ItemModel.objects.all()[1], serial_number='s1').save()
        cls.instrument_data = {
            "item_model": ItemModel.objects.all()[0].pk,
            "serial_number": "s2",
            "comment": "my comment",
            "instrumentcategory_set": []
        }

    def test_instrument_create_auth(self):
        response = self.client.post(reverse('instruments_list'), data=json.dumps(self.instrument_data),
                                    content_type='application/json',
                                    HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_instrument_list(self):
        response = self.client.get(reverse('instruments_list'), {'get_all': 'true'}, HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        instruments = Instrument.objects.all()
        serializer = ListInstrumentReadSerializer(instruments, many=True)
        self.assertEqual(serializer.data, response.data['data'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_instrument(self):
        pk = Instrument.objects.all()[0].pk
        response = self.client.get(reverse('instrument_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        instrument = Instrument.objects.get(pk=pk)
        serializer = ListInstrumentReadSerializer(instrument)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_instrument_edit_auth(self):
        pk = Instrument.objects.all()[0].pk
        self.instrument_data['comment'] = "testing new comment"
        response = self.client.put(reverse('instrument_detail', args=[pk]), data=json.dumps(self.instrument_data),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        instrument = Instrument.objects.get(pk=pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(instrument.comment, response.data['comment'])

    def test_instrument_delete_auth(self):
        pk = Instrument.objects.all()[1].pk
        response = self.client.delete(reverse('instrument_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_instrument_filter_model_num(self):
        model_number = 'm1'
        response = self.client.get(reverse('instrument_search'), {'model_number': model_number, 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        instruments = Instrument.objects.filter(item_model__model_number=model_number)
        serializer = ListInstrumentReadSerializer(instruments, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data['data'])

    def test_instrument_filter_model_pk(self):
        model_pk = ItemModel.objects.all()[1].pk
        response = self.client.get(reverse('instrument_search'), {'model_pk': model_pk, 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        instruments = Instrument.objects.filter(item_model__pk=model_pk)
        serializer = ListInstrumentReadSerializer(instruments, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data['data'])

    def test_instrument_sort_cal_exp(self):
        # difficult to test content of results without using the same endpoint, can manually check if needed
        response = self.client.get(reverse('instrument_search'), {'sort_by': 'calibration_expiration_date', 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response2 = self.client.get(reverse('instrument_search'), {'sort_by': '-calibration_expiration_date', 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['data'], response2.data['data'])

    def test_instrument_sort_model_num(self):
        response = self.client.get(reverse('instrument_search'), {'sort_by': 'model_number_lower', 'get_all': True},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        instruments = Instrument.objects.order_by('item_model__model_number')
        serializer = ListInstrumentReadSerializer(instruments, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(serializer.data, response.data['data'])
