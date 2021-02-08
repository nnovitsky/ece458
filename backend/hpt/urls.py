"""hpt URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from backend.tables import views
from backend.tables import api_views
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token


urlpatterns = [
    path('admin/', admin.site.urls),
    path('current_user/', views.current_user),
    path('token_auth/', obtain_jwt_token),
    path('token_refresh/', refresh_jwt_token),
    path('create_user/', views.UserCreate.as_view()),
    path('api/users/', views.user_list),
    path('api/vendors/', views.vendor_list),
    path('api/models_by_vendor/<str:vendor>/', views.model_by_vendor_list),
    path('api/models/', views.models_list),
    path('api/models/<int:pk>/', views.models_detail),
    path('api/instruments/', views.instruments_list),
    path('api/instruments/<int:pk>/', views.instruments_detail),
    path('api/calibration_events/', views.calibration_event_list),
    path('api/calibration_events/<int:pk>/', views.calibration_event_detail),
    path('api/model_search/', api_views.ItemModelList.as_view()),
    path('api/instrument_search/', api_views.InstrumentList.as_view()),
    path('api/calibration_event_search/', api_views.CalibrationEventList.as_view())
]
