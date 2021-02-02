from django.urls import path

from backend.tables import views

urlpatterns = [
    path('', views.index, name='index'),
]