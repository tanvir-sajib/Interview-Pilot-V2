import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_stt_provider_failure(monkeypatch):
    # Upload a small valid audio file first
    small_content = b"audio data"
    upload_resp = client.post(
        "/upload",
        files={"file": ("audio.wav", small_content, "audio/wav")},
        headers={"X-User-Id": "user1"},
    )
    assert upload_resp.status_code == 200
    storage_key = upload_resp.json()["storage_key"]
    # Force the failing STT provider
    monkeypatch.setenv("STT_PROVIDER", "failing")
    # Process endpoint should now raise a 500 internal server error
    process_resp = client.post(
        f"/process/{storage_key}",
        headers={"X-User-Id": "user1"},
    )
    assert process_resp.status_code == 500
    # Clean up env
    monkeypatch.delenv("STT_PROVIDER", raising=False)
