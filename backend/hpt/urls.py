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
from backend.tables import loadbank_views
from backend.tables import klufe_views
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token


urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/current_user/', views.current_user, name='current_user'),
    path('api/token_auth/', views.TokenAuth.as_view(), name='token_auth'),
    path('api/token_refresh/', refresh_jwt_token, name='token_refresh'),
    path('api/create_user/', views.UserCreate.as_view(), name='create_user'),
    path('api/users/', views.user_list, name='user_list'),
    path('api/toggle_groups/<int:user_pk>/', views.toggle_groups),
    path('api/permissions_list/', views.get_permissions),
    path('api/vendors/', views.vendor_list, name='vendor_list'),
    path('api/models_by_vendor/<str:vendor>/', views.model_by_vendor_list, name='models_by_vendor'),
    path('api/models/', views.models_list, name='models_list'),
    path('api/models/<int:pk>/', views.models_detail, name='model_detail'),
    path('api/instruments/', views.instruments_list, name='instruments_list'),
    path('api/instruments/<int:pk>/', views.instruments_detail, name='instrument_detail'),
    path('api/calibration_events/', views.calibration_event_list, name='calibration_events_list'),
    path('api/calibration_events/<int:pk>/', views.calibration_event_detail, name='calibration_event_detail'),
    path('api/model_search/', api_views.ItemModelList.as_view(), name='model_search'),
    path('api/instrument_search/', api_views.InstrumentList.as_view(), name='instrument_search'),
    path('api/calibration_event_search/', api_views.CalibrationEventList.as_view(), name='calibration_event_search'),
    path('api/export_calibration_event_pdf/<int:pk>/', views.export_calibration_event_pdf),
    path('api/import_models_csv/', views.import_models_csv),
    path('api/import_instruments_csv/', views.import_instruments_csv),
    path('api/export_models_csv/', api_views.ItemModelExport.as_view()),
    path('api/export_instruments_csv/', api_views.InstrumentExport.as_view()),
    path('api/export_example_model_csv/', views.get_example_model_csv),
    path('api/export_example_instrument_csv/', views.get_example_instrument_csv),
    path('api/oauth/consume/', views.OauthConsume.as_view()),
    path('api/model_categories/', views.model_category_list),
    path('api/model_categories/<int:pk>/', views.model_category_detail),
    path('api/instrument_categories/', views.instrument_category_list),
    path('api/instrument_categories/<int:pk>/', views.instrument_category_detail),
    path('api/category_list/<str:type>/', views.category_list),
    path('api/calibration_event_file/<int:pk>/', views.calibration_event_file),
    path('api/category_list/<str:type>/', views.category_list),
    path('api/new_loadbank_cal/', loadbank_views.start_loadbank_cal),
    path('api/update_lb_cal/<int:lb_cal_pk>/', loadbank_views.update_lb_cal_field),
    path('api/load_levels/<int:lb_cal_pk>/<int:page>/', loadbank_views.get_load_levels),
    path('api/voltage_test/', loadbank_views.get_test_voltage),
    path('api/add_current_reading/<int:lb_cal_pk>/', loadbank_views.add_current_reading),
    path('api/add_voltage_reading/<int:lb_cal_pk>/', loadbank_views.add_voltage_reading),
    path('api/cancel_lb_cal/<int:lb_cal_pk>/', loadbank_views.cancel_lb_cal),
    path('api/lb_cal_event_details/<int:lb_cal_pk>/', loadbank_views.lb_cal_details),
    path('api/calibration_modes/', views.get_calibration_modes),
    path('api/cal_download/<int:cal_pk>/', views.CalibrationArtifact.as_view()),
    path('api/start_klufe_cal/', klufe_views.start_klufe),
    path('api/klufe_detail/<int:klufe_pk>/', klufe_views.klufe_cal_detail),
    path('api/klufe_test/<int:klufe_pk>/', klufe_views.klufe_test),
    path('api/klufe_on/', klufe_views.turn_source_on),
    path('api/klufe_off/', klufe_views.turn_source_off),
    path('api/set_klufe/', klufe_views.set_source),
    path('api/save_klufe/<int:klufe_pk>/', klufe_views.save_calibration),
    path('api/cancel_klufe_cal/<int:klufe_pk>/', klufe_views.cancel_klufe_cal),
    path('api/update_klufe_cal/<int:klufe_pk>/', klufe_views.edit_klufe_cal),
    path('api/export_barcodes/', api_views.BarcodeExport.as_view()),
    path('api/calibration_approval/<int:cal_event_pk>/', views.cal_approval)
]
