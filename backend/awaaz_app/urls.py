from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # Root API endpoint
    path('upload/', views.upload_audio, name='upload_audio'),
    path('spectrogram/<str:filename>/', views.spectrogram_view, name='spectrogram'),
]
