from django.contrib import admin

from .models import Alert, Equipment, Profile, Recording


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "employee_id", "department", "user")
    search_fields = ("full_name", "employee_id", "user__email")


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "plant_location", "status", "updated_at")
    list_filter = ("category", "status", "plant_location")
    search_fields = ("name", "serial_number")


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ("id", "equipment", "user", "prediction", "analyzed", "created_at")
    list_filter = ("analyzed", "prediction")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "severity", "status", "equipment", "created_at")
    list_filter = ("severity", "status")
