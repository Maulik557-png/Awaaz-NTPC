from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("auth/register/", views.register, name="register"),
    path("auth/login/", views.login, name="login"),
    path("auth/logout/", views.logout, name="logout"),
    path("auth/me/", views.me, name="me"),
    path("equipment/", views.equipment_list, name="equipment_list"),
    path("equipment/<int:pk>/", views.equipment_detail, name="equipment_detail"),
    path("recordings/", views.recordings_list, name="recordings_list"),
    path("upload/", views.upload_audio, name="upload_audio"),
    path("alerts/", views.alerts_list, name="alerts_list"),
    path("alerts/<int:pk>/", views.alert_detail, name="alert_detail"),
]
