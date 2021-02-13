import json
from rest_framework import status
from django.test import TestCase, Client
from django.urls import reverse
from backend.tables.models import *
from backend.tables.serializers import *


client = Client()

# path('current_user/', views.current_user),
#     path('token_auth/', obtain_jwt_token),
#     path('token_refresh/', refresh_jwt_token),
#     path('create_user/', views.UserCreate.as_view()),
#     path('api/users/', views.user_list),
"""
tests: 
- create user (auth/non auth/anonymous)
- token auth (auth/non auth)
- get current user (auth/non auth)
- edit current user (auth/non auth) (username, fname, lname, pw, email) (check length when limits enforced)
- token refresh (auth/non auth)
- user list (auth/non auth)
"""

class CreateUserTest(TestCase):

    def setUp(self):
        User.objects.all().delete()
        u = User(username="newUser", password="pw123", first_name="fname", last_name="lname", email="e@g.com")
        u.is_staff = True
        u.save()

    def test_create_user_nonauth(self):
        response = client.post(reverse())