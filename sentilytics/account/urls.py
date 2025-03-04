from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import register,logout
urlpatterns = [
    path('register/', register),
    path('login/', obtain_auth_token),
    path('logout/',logout),
]