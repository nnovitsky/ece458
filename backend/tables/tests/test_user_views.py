import json
from rest_framework import status
from django.test import TestCase, Client
from django.urls import reverse
from backend.tables.models import *
from backend.tables.serializers import *


"""
tests: 
- create user (auth/non auth/anonymous)
- token auth (auth/non auth)
- get current user (auth/non auth)
- edit current user (auth/non auth) (username, fname, lname, pw, email) (check length when limits enforced)
    - test changing first name successfully
    - test changing to existing username unsuccessfully
- token refresh (auth/non auth)
- user list (auth)
"""


class UserTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.client = Client()
        User.objects.all().delete()
        cls.userData = {
            'username': "newUser",
            'password': "pw123",
            'first_name': "fname",
            'last_name': "lname",
            'email': "e@g.com"
        }
        cls.loginData = {
            'username': cls.userData['username'],
            'password': cls.userData['password']
        }
        cls.token_staff, cls.user_staff = cls.make_user(username="newUser", is_staff=True, data=cls.userData, login=cls.loginData, client=cls.client)
        cls.token_non_staff, cls.user_non_staff = cls.make_user(username="newUser2", is_staff=False, data=cls.userData, login=cls.loginData, client=cls.client)

    @classmethod
    def make_user(cls, username, is_staff, data, login, client):
        data['username'] = username
        login['username'] = username
        u = User(**data)
        u.set_password("pw123")
        u.is_staff = is_staff
        u.save()
        response = client.post(reverse('token_auth'), data=json.dumps(login), content_type='application/json')
        return response.data['token'], u

    def test_create_user_anonymous(self):
        self.userData['username'] = "newUser3"
        response = self.client.post(reverse('create_user'), data=json.dumps(self.userData), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_nonauth(self):
        self.userData['username'] = "newUser3"
        response = self.client.post(reverse('create_user'), data=json.dumps(self.userData),
                                    content_type='application/json', HTTP_AUTHORIZATION='JWT {}'.format(self.token_non_staff))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_auth(self):
        self.userData['username'] = "newUser3"
        response = self.client.post(reverse('create_user'), data=json.dumps(self.userData),
                                    content_type='application/json', HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_auth_user_auth(self):
        response = self.client.post(reverse('token_auth'), data=json.dumps(self.loginData), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_auth_user_bad_data(self):
        response = self.client.post(reverse('token_auth'), data=json.dumps({'username': 'bad', 'password': 'none'}),
                                    content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_nonauth(self):
        response = self.client.get(reverse('current_user'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_auth(self):
        response = self.client.get(reverse('current_user'), HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        serializer = UserSerializer(self.user_staff)
        self.assertEqual(serializer.data, response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_list(self):
        response = self.client.get(reverse('user_list'), {'get_all': 'true'}, HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff))
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        self.assertEqual(serializer.data, response.data['data'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_edit_first_name(self):
        name = "new name"
        response = self.client.put(reverse('current_user'), data=json.dumps({'first_name': name}),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], name)

    def test_user_edit_bad_username(self):
        username = self.user_non_staff.username
        response = self.client.put(reverse('current_user'), data=json.dumps({'username': username}),
                                   HTTP_AUTHORIZATION='JWT {}'.format(self.token_staff), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_token_nonauth(self):
        response = self.client.post(reverse('token_refresh'), data=json.dumps({'token': ""}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_token_auth(self):
        response = self.client.post(reverse('token_refresh'), data=json.dumps({'token': self.token_staff}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
