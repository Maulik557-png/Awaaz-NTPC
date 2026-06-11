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

class Equipment(models.Model):
    EQUIPMENT_CATEGORIES = [
        ('motor', 'Motor'),
        ('pump', 'Pump'),
        ('valve', 'Valve'),
        ('turbine', 'Turbine'),
        ('heat_exchanger', 'Heat Exchanger'),
        ('compressor', 'Compressor'),
        ('fan', 'Fan'),
        ('gearbox', 'Gearbox'),
        ('bearing', 'Bearing'),
        ('other', 'Other'),
    ]

    PLANT_LOCATIONS = [
        ('unit_a', 'Unit A'),
        ('unit_b', 'Unit B'),
        ('unit_c', 'Unit C'),
        ('unit_t', 'Unit T'),
        ('hx5_area', 'HX5 Area'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=EQUIPMENT_CATEGORIES)
    plant_location = models.CharField(max_length=20, choices=PLANT_LOCATIONS)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category}, {self.plant_location})"

    class Meta:
        ordering = ['name']
