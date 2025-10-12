from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/upload/', views.upload_audio, name='upload_audio'),
    path('api/spectrogram/<str:filename>/', views.spectrogram_view, name='spectrogram'),
]
