from django.urls import path
from backend.tables.views import index, current_user, UserList

urlpatterns = [
    path('', index, name='index'),
    path('current_user/', current_user),
    path('users/', UserList.as_view())
]