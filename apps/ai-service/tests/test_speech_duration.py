import sys, os, io, wave
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def generate_wav_bytes(duration_sec: float = 1.0, sample_rate: int = 8000) -> bytes:
    n_frames = int(duration_sec * sample_rate)
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(sample_rate)
        wf.writeframes(b'\x00\x00' * n_frames)
    return buffer.getvalue()

def test_speech_duration_endpoint():
    wav_bytes = generate_wav_bytes(duration_sec=1.0, sample_rate=8000)
    upload_resp = client.post(
        "/upload",
        files={"file": ("audio.wav", wav_bytes, "audio/wav")},
        headers={"X-User-Id": "user1"},
    )
    assert upload_resp.status_code == 200
    storage_key = upload_resp.json()["storage_key"]
    resp = client.get(f"/speech-duration/{storage_key}", headers={"X-User-Id": "user1"})
    assert resp.status_code == 200
    data = resp.json()
    assert abs(data["speech_duration_seconds"] - 1.0) < 0.01
