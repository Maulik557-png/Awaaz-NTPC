// simple recording & upload (browser)
let mediaRecorder, chunks = [];
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.start();
}
function stopRecordingAndUpload() {
  mediaRecorder.stop();
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, 'recording.webm');
    const response = await fetch('/api/upload/', { method: 'POST', body: form });
    const result = await response.json();
    if (response.ok) {
      const img = document.getElementById('spectrogramImg');
      img.src = result.spectrogram_url;
      img.style.display = 'block';
      alert(`Prediction: ${result.prediction}, Remedies: ${result.remedies}`);
    } else {
      alert('Upload failed');
    }
    chunks = [];
  };
}
