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
    path('api/admin/', admin.site.urls),
    path('api/current_user/', views.current_user, name='current_user'),
    path('api/token_auth/', obtain_jwt_token, name='token_auth'),
    path('api/token_refresh/', refresh_jwt_token, name='token_refresh'),
    path('api/create_user/', views.UserCreate.as_view(), name='create_user'),
    path('api/users/', views.user_list, name='user_list'),
    path('api/vendors/', views.vendor_list, name='vendor_list'),
    path('api/models_by_vendor/<str:vendor>/', views.model_by_vendor_list, name='models_by_vendor'),
    path('api/models/', views.models_list, name='models_list'),
    path('api/models/<int:pk>/', views.models_detail, name='model_detail'),
    path('api/instruments/', views.instruments_list, name='instruments_list'),
    path('api/instruments/<int:pk>/', views.instruments_detail, name='instrument_detail'),
    path('api/calibration_events/', views.calibration_event_list, name='calibration_events_list'),
    path('api/calibration_events/<int:pk>/', views.calibration_event_detail, name='calibration_event_detail'),
    path('api/model_search/', api_views.ItemModelList.as_view()),
    path('api/instrument_search/', api_views.InstrumentList.as_view()),
    path('api/calibration_event_search/', api_views.CalibrationEventList.as_view()),
    path('api/export_calibration_event_pdf/<int:pk>/', views.export_calibration_event_pdf),
    path('api/import_models_csv/', views.import_models_csv),

]
