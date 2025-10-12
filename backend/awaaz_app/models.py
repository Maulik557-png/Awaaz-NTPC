from django.db import models

class Audio(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Spectrogram(models.Model):
    audio = models.ForeignKey(Audio, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='sources/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Spectrogram for {self.audio.title}'