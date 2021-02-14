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
#TODO: add instrument filter/sort tests
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
        Instrument(item_model=ItemModel.objects.get(pk=1), serial_number='s1', comment="a comment").save()
        Instrument(item_model=ItemModel.objects.get(pk=2), serial_number='s1').save()
        cls.instrument_data = {
            "item_model": 1,
            "serial_number": "s2",
            "comment": "my comment"
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
        pk = 1
        response = self.client.get(reverse('instrument_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        instrument = Instrument.objects.get(pk=pk)
        serializer = DetailInstrumentReadSerializer(instrument)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_instrument_edit_auth(self):
        pk = 1
        self.instrument_data['comment'] = "testing new comment"
        response = self.client.put(reverse('instrument_detail', args=[pk]), data=json.dumps(self.instrument_data),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        instrument = Instrument.objects.get(pk=pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(instrument.comment, response.data['comment'])

    def test_instrument_delete_auth(self):
        pk = 2
        response = self.client.delete(reverse('instrument_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

