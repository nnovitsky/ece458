import json
from rest_framework import status
from django.test import TestCase
from django.urls import reverse
from backend.tables.models import *
from backend.tables.serializers import *
from backend.tables.utils import setUpTestAuth


"""
tests: 
- create cal event
- get all cal events
- get single cal event
- edit cal event
- delete cal event
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
        CalibrationEvent(instrument=Instrument.objects.get(pk=1), date='2020-12-31', comment="cal", user=cls.user_staff).save()
        CalibrationEvent(instrument=Instrument.objects.get(pk=1), date='2019-12-31', user=cls.user_non_staff).save()
        cls.cal_event_data = {
            "instrument": 1,
            "date": "2021-01-10",
            "comment": "my comment",
            "user": 2
        }

    def test_cal_event_create_auth(self):
        response = self.client.post(reverse('calibration_events_list'), data=json.dumps(self.cal_event_data),
                                    content_type='application/json',
                                    HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_cal_event_list(self):
        response = self.client.get(reverse('calibration_events_list'), {'get_all': 'true'}, HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        cal_events = CalibrationEvent.objects.all()
        serializer = CalibrationEventReadSerializer(cal_events, many=True)
        self.assertEqual(serializer.data, response.data['data'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_single_cal_event(self):
        pk = 1
        response = self.client.get(reverse('calibration_event_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        cal_event = CalibrationEvent.objects.get(pk=pk)
        serializer = CalibrationEventReadSerializer(cal_event)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_instrument_edit_auth(self):
        pk = 1
        self.cal_event_data['date'] = "2021-02-01"
        response = self.client.put(reverse('calibration_event_detail', args=[pk]), data=json.dumps(self.cal_event_data),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        cal_event = CalibrationEvent.objects.get(pk=pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(cal_event.date), response.data['date'])

    def test_cal_event_delete_auth(self):
        pk = 1
        response = self.client.delete(reverse('calibration_event_detail', args=[pk]), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_cal_event_filter_user(self):
        username = "newUser2"
        response = self.client.get(reverse('calibration_event_search'), {'user': username},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        cal_events = CalibrationEvent.objects.filter(user__username=username)
        serializer = SimpleCalibrationEventReadSerializer(cal_events, many=True)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cal_event_filter_instrument(self):
        ins_pk = 1
        response = self.client.get(reverse('calibration_event_search'), {'instrument_pk': ins_pk},
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        cal_events = CalibrationEvent.objects.filter(instrument__pk=ins_pk)
        serializer = SimpleCalibrationEventReadSerializer(cal_events, many=True)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
