import logging
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)

_model = None

REMEDIES = {
    0: "No immediate action — continue routine monitoring",
    1: "Check fan alignment",
    2: "Inspect gearbox oil",
    3: "Check pump valves",
    4: "Inspect slider mechanism / valve maintenance required",
}

FAULT_LABELS = {
    0: "Normal",
    1: "Fan misalignment",
    2: "Gearbox issue",
    3: "Pump valve issue",
    4: "Slider / valve fault",
}


def get_model():
    global _model
    if _model is None:
        from tensorflow.keras.models import load_model

        model_path = Path(settings.MODEL_ROOT) / "cnn_model.h5"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        _model = load_model(str(model_path))
        logger.info("Loaded CNN model from %s", model_path)
    return _model


def generate_spectrogram(audio_path: str) -> str:
    """Convert audio to WAV if needed, build mel spectrogram, return relative path."""
    import librosa
    import librosa.display
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    from pydub import AudioSegment

    path = Path(audio_path)
    if path.suffix.lower() == ".webm":
        wav_path = path.with_suffix(".wav")
        audio = AudioSegment.from_file(str(path), format="webm")
        audio.export(str(wav_path), format="wav")
        path = wav_path

    y, sr = librosa.load(str(path))
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)

    plt.figure(figsize=(10, 4))
    librosa.display.specshow(S_dB, sr=sr, x_axis="time", y_axis="mel")
    plt.colorbar(format="%+2.0f dB")
    plt.title("Mel-frequency spectrogram")
    plt.tight_layout()

    sources_dir = Path(settings.MEDIA_ROOT) / "sources"
    sources_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{path.stem}.png"
    full_image_path = sources_dir / filename
    plt.savefig(str(full_image_path))
    plt.close()
    return f"sources/{filename}"


def preprocess_image(image_path: str):
    import numpy as np
    from PIL import Image

    img = Image.open(image_path).convert("L")
    img = img.resize((128, 64))
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=[0, -1])


def predict_fault(image_path: str) -> int:
    import numpy as np

    model = get_model()
    img = preprocess_image(image_path)
    pred = model.predict(img, verbose=0)
    return int(np.argmax(pred))


def map_prediction_to_remedy(pred: int) -> str:
    return REMEDIES.get(pred, "No remedy found")


def fault_label(pred: int) -> str:
    return FAULT_LABELS.get(pred, f"Fault {pred}")


def prediction_to_severity(pred: int) -> str:
    if pred is None or pred == 0:
        return "info"
    if pred <= 2:
        return "warning"
    return "critical"


def prediction_to_equipment_status(pred: int) -> str:
    if pred is None or pred == 0:
        return "healthy"
    if pred <= 2:
        return "warning"
    return "critical"
