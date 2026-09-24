import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_invalid_file_type():
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"not audio", "text/plain")},
        headers={"X-User-Id": "user1"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"

def test_file_too_large():
    large_content = b"a" * (10 * 1024 * 1024 + 1)  # 10MB + 1 byte
    response = client.post(
        "/upload",
        files={"file": ("audio.wav", large_content, "audio/wav")},
        headers={"X-User-Id": "user1"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "File too large"

def test_cross_user_access():
    # Upload as user1
    small_content = b"audio data"
    upload_resp = client.post(
        "/upload",
        files={"file": ("audio.wav", small_content, "audio/wav")},
        headers={"X-User-Id": "user1"},
    )
    assert upload_resp.status_code == 200
    storage_key = upload_resp.json()["storage_key"]
    # Attempt to process as a different user
    process_resp = client.post(
        f"/process/{storage_key}",
        headers={"X-User-Id": "user2"},
    )
    assert process_resp.status_code == 403
    assert process_resp.json()["detail"] == "Access denied"
