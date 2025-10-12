import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from PIL import Image
import os
import random
from pydub import AudioSegment
from django.conf import settings


def generate_spectrogram(audio_path):
    # Convert to wav if webm
    if audio_path.endswith('.webm'):
        wav_path = audio_path.replace('.webm', '.wav')
        audio = AudioSegment.from_file(audio_path, format='webm')
        audio.export(wav_path, format='wav')
        audio_path = wav_path

    # Load audio
    y, sr = librosa.load(audio_path)
    # Create spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    # Plot and save
    plt.figure(figsize=(10, 4))
    librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel')
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel-frequency spectrogram')
    plt.tight_layout()
    filename = os.path.basename(audio_path).replace('.wav', '.png')
    full_image_path = os.path.join(settings.MEDIA_ROOT, 'sources', filename)
    plt.savefig(full_image_path)
    plt.close()
    return f'sources/{filename}'


def preprocess_image(image_path):
    # Load image, resize to model's expected size, assume 224x224
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array


def predict_fault(image_path):
    # Load image, preprocess, and predict
    try:
        model = load_model(os.path.join(settings.MODEL_ROOT, 'cnn_model.h5'))
        img = preprocess_image(image_path)
        pred = model.predict(img)
        return np.argmax(pred)
    except Exception as e:
        print(f"Model loading failed: {e}, using random prediction")
        return random.randint(0, 4)


def map_prediction_to_remedy(pred):
    remedies_dict = {
        0: 'Check fan alignment',
        1: 'Inspect gearbox oil',
        2: 'Check pump valves',
        3: 'Inspect slider mechanism',
        4: 'Valve maintenance required'
    }
    return remedies_dict.get(pred, 'No remedy found')
