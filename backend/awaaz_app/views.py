import logging
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Alert, Equipment, Profile, Recording
from .serializers import (
    AlertSerializer,
    EquipmentSerializer,
    ProfileSerializer,
    RecordingSerializer,
    RegisterSerializer,
)
from .utils import (
    fault_label,
    generate_spectrogram,
    map_prediction_to_remedy,
    predict_fault,
    prediction_to_equipment_status,
    prediction_to_severity,
)

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(["GET"])
@permission_classes([AllowAny])
def index(request):
    return Response(
        {
            "status": "running",
            "message": "Awaaz NTPC API Server",
            "endpoints": {
                "register": "/api/auth/register/",
                "login": "/api/auth/login/",
                "logout": "/api/auth/logout/",
                "me": "/api/auth/me/",
                "equipment": "/api/equipment/",
                "recordings": "/api/recordings/",
                "upload": "/api/upload/",
                "alerts": "/api/alerts/",
            },
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    profile = user.profile
    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": profile.full_name,
                "employee_id": profile.employee_id,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    if not email or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=email, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)
    profile = getattr(user, "profile", None)
    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": profile.full_name if profile else "",
                "employee_id": profile.employee_id if profile else "",
                "department": profile.department if profile else "",
                "phone": profile.phone if profile else "",
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"detail": "Logged out."})


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    profile, _ = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            "employee_id": f"EMP-{request.user.id}",
            "full_name": request.user.get_full_name() or request.user.username,
        },
    )
    if request.method == "GET":
        return Response(ProfileSerializer(profile).data)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def equipment_list(request):
    if request.method == "GET":
        qs = Equipment.objects.all()
        category = request.query_params.get("category")
        status_filter = request.query_params.get("status")
        plant = request.query_params.get("plant_location")
        search = request.query_params.get("search")
        if category and category != "all":
            qs = qs.filter(category=category)
        if status_filter and status_filter != "all":
            qs = qs.filter(status=status_filter)
        if plant and plant != "all":
            qs = qs.filter(plant_location=plant)
        if search:
            qs = qs.filter(name__icontains=search)
        return Response(EquipmentSerializer(qs, many=True).data)

    serializer = EquipmentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(created_by=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def equipment_detail(request, pk):
    try:
        equipment = Equipment.objects.get(pk=pk)
    except Equipment.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(EquipmentSerializer(equipment).data)
    if request.method == "DELETE":
        equipment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = EquipmentSerializer(equipment, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recordings_list(request):
    qs = Recording.objects.select_related("equipment", "user").all()
    limit = request.query_params.get("limit")
    date = request.query_params.get("date")
    if date:
        qs = qs.filter(created_at__date=date)
    if limit:
        try:
            qs = qs[: int(limit)]
        except ValueError:
            pass
    serializer = RecordingSerializer(qs, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_audio(request):
    audio_file = request.FILES.get("audio")
    equipment_id = request.data.get("equipment_id")
    duration = request.data.get("duration", 0)

    if not audio_file:
        return Response(
            {"detail": "audio file is required."}, status=status.HTTP_400_BAD_REQUEST
        )
    if not equipment_id:
        return Response(
            {"detail": "equipment_id is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        equipment = Equipment.objects.get(pk=equipment_id)
    except Equipment.DoesNotExist:
        return Response(
            {"detail": "Equipment not found."}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        duration_int = int(duration)
    except (TypeError, ValueError):
        duration_int = 0

    recording = Recording.objects.create(
        equipment=equipment,
        user=request.user,
        audio_file=audio_file,
        duration=duration_int,
    )

    try:
        spectrogram_rel = generate_spectrogram(recording.audio_file.path)
        recording.spectrogram.name = spectrogram_rel
        image_path = Path(settings.MEDIA_ROOT) / spectrogram_rel
        prediction = predict_fault(str(image_path))
        remedies = map_prediction_to_remedy(prediction)
        recording.prediction = prediction
        recording.remedies = remedies
        recording.analyzed = True
        recording.health_score = max(0, 100 - (prediction * 20))
        recording.save()

        equipment.status = prediction_to_equipment_status(prediction)
        equipment.last_inspection = timezone.now()
        equipment.save(update_fields=["status", "last_inspection", "updated_at"])

        if prediction and prediction > 0:
            Alert.objects.create(
                equipment=equipment,
                recording=recording,
                severity=prediction_to_severity(prediction),
                title=f"{fault_label(prediction)} detected",
                message=(
                    f"{fault_label(prediction)} on {equipment.name}. "
                    f"Recommendation: {remedies}"
                ),
            )
    except Exception as exc:
        logger.exception("Analysis failed for recording %s", recording.id)
        recording.analyzed = False
        recording.notes = f"Analysis failed: {exc}"
        recording.save(update_fields=["analyzed", "notes"])
        return Response(
            {
                "detail": f"Recording saved but analysis failed: {exc}",
                "recording": RecordingSerializer(
                    recording, context={"request": request}
                ).data,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "prediction": recording.prediction,
            "remedies": recording.remedies,
            "fault_label": fault_label(recording.prediction or 0),
            "recording": RecordingSerializer(
                recording, context={"request": request}
            ).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def alerts_list(request):
    qs = Alert.objects.select_related("equipment").all()
    status_filter = request.query_params.get("status")
    severity = request.query_params.get("severity")
    if status_filter and status_filter not in ("all",):
        qs = qs.filter(status=status_filter)
    if severity and severity not in ("all",):
        qs = qs.filter(severity=severity)
    return Response(AlertSerializer(qs, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def alert_detail(request, pk):
    try:
        alert = Alert.objects.get(pk=pk)
    except Alert.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status not in ("acknowledged", "resolved", "active"):
        return Response(
            {"detail": "status must be acknowledged, resolved, or active."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    alert.status = new_status
    if new_status == "acknowledged":
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
    elif new_status == "resolved":
        alert.resolved_at = timezone.now()
        if not alert.acknowledged_at:
            alert.acknowledged_by = request.user
            alert.acknowledged_at = timezone.now()
    alert.save()
    return Response(AlertSerializer(alert).data)
