from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    employee_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar_url = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


class Equipment(models.Model):
    CATEGORY_CHOICES = [
        ("motors", "Motors"),
        ("pumps", "Pumps"),
        ("valves", "Valves"),
        ("turbines", "Turbines"),
        ("heat_exchangers", "Heat Exchangers"),
    ]
    STATUS_CHOICES = [
        ("healthy", "Healthy"),
        ("warning", "Warning"),
        ("critical", "Critical"),
        ("offline", "Offline"),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    model = models.CharField(max_length=100, blank=True, default="")
    serial_number = models.CharField(max_length=100, blank=True, default="")
    plant_location = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="healthy"
    )
    last_inspection = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="equipment_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.category})"


class Recording(models.Model):
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name="recordings"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recordings",
    )
    audio_file = models.FileField(upload_to="uploads/")
    spectrogram = models.ImageField(upload_to="sources/", null=True, blank=True)
    duration = models.PositiveIntegerField(default=0)
    prediction = models.IntegerField(null=True, blank=True)
    remedies = models.TextField(blank=True, default="")
    health_score = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    analyzed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Recording {self.id} - {self.equipment.name}"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ("info", "Info"),
        ("warning", "Warning"),
        ("critical", "Critical"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("acknowledged", "Acknowledged"),
        ("resolved", "Resolved"),
    ]

    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name="alerts",
        null=True,
        blank=True,
    )
    recording = models.ForeignKey(
        Recording,
        on_delete=models.CASCADE,
        related_name="alerts",
        null=True,
        blank=True,
    )
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts_acknowledged",
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.severity}: {self.title}"
