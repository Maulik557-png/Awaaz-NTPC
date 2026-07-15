from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Alert, Equipment, Profile, Recording

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_id",
            "email",
            "employee_id",
            "full_name",
            "department",
            "phone",
            "avatar_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user_id", "employee_id", "created_at", "updated_at"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=100)
    employee_id = serializers.CharField(max_length=50)

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value):
        if Profile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already registered.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
        )
        Profile.objects.create(
            user=user,
            employee_id=validated_data["employee_id"],
            full_name=validated_data["full_name"],
        )
        return user


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "category",
            "model",
            "serial_number",
            "plant_location",
            "status",
            "last_inspection",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class RecordingSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    equipment_category = serializers.CharField(
        source="equipment.category", read_only=True
    )
    audio_url = serializers.SerializerMethodField()
    spectrogram_url = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = [
            "id",
            "equipment",
            "equipment_name",
            "equipment_category",
            "user",
            "audio_url",
            "spectrogram_url",
            "duration",
            "prediction",
            "remedies",
            "health_score",
            "notes",
            "analyzed",
            "created_at",
        ]
        read_only_fields = fields

    def get_audio_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file and request:
            return request.build_absolute_uri(obj.audio_file.url)
        if obj.audio_file:
            return obj.audio_file.url
        return None

    def get_spectrogram_url(self, obj):
        request = self.context.get("request")
        if obj.spectrogram and request:
            return request.build_absolute_uri(obj.spectrogram.url)
        if obj.spectrogram:
            return obj.spectrogram.url
        return None


class AlertSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(
        source="equipment.name", read_only=True, default=None
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "equipment",
            "equipment_name",
            "recording",
            "severity",
            "status",
            "title",
            "message",
            "acknowledged_by",
            "acknowledged_at",
            "resolved_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "equipment",
            "recording",
            "severity",
            "title",
            "message",
            "acknowledged_by",
            "acknowledged_at",
            "resolved_at",
            "created_at",
        ]
