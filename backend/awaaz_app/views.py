import logging
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import generate_spectrogram, predict_fault, map_prediction_to_remedy
from .models import Audio, Spectrogram

logger = logging.getLogger(__name__)


# Remove the index view if it's not meant to serve a Django template
# def index(request):
#     return render(request, 'index.html')


@csrf_exempt
def upload_audio(request):
    if request.method == 'POST':
        logger.info("Received audio upload request")
        audio_file = request.FILES['audio']
        logger.info(f"Audio file: {audio_file.name}, size: {audio_file.size}")
        audio = Audio.objects.create(title=audio_file.name, file=audio_file)
        logger.info(f"Audio saved: {audio.file.path}")

        # Generate spectrogram
        spectrogram_path = generate_spectrogram(audio.file.path)
        logger.info(f"Spectrogram generated: {spectrogram_path}")
        spectrogram = Spectrogram.objects.create(
            audio=audio, image=spectrogram_path)
        logger.info(f"Spectrogram saved: {spectrogram.image.path}")

        # Predict fault
        prediction = predict_fault(spectrogram.image.path)
        logger.info(f"Prediction: {prediction}")

        # Send remedies back
        remedies = map_prediction_to_remedy(prediction)
        logger.info(f"Remedies: {remedies}")
        return JsonResponse({'prediction': prediction, 'remedies': remedies, 'spectrogram_url': spectrogram.image.url})


def spectrogram_view(request, filename):
    spectrogram = get_object_or_404(Spectrogram, image=f'sources/{filename}')
    return FileResponse(spectrogram.image.open(), content_type='image/png')
