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
from django.urls import path, include
from backend.tables import views
from django.conf.urls import url
from rest_framework_jwt.views import obtain_jwt_token


urlpatterns = [
    path('admin/', admin.site.urls),
    path('tables/', include('tables.urls')),
    url(r'^api/models/$', views.models_list),
    url(r'^api/models/(?P<pk>[0-9]+)$', views.models_detail),
    url(r'^api/instruments/$', views.instruments_list),
    url(r'^api/instruments/(?P<pk>[0-9]+)$', views.instruments_detail),
    path('token-auth/', obtain_jwt_token),
]
