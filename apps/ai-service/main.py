from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header
from typing import Optional
import uuid
import os
from storage import get_storage_provider, IStorageProvider
from stt import get_stt_provider, ISTTProvider
from metrics import compute_delivery_metrics, compute_speech_duration
from models import UploadResponse, ProcessResponse, MetricsResponse

app = FastAPI()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_file(file: UploadFile):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    # Size validation will be performed after reading content

@app.get("/speech-duration/{audio_id:path}")
async def get_speech_duration(
    audio_id: str,
    user_id: str = Header(..., alias="X-User-Id"),
    storage: IStorageProvider = Depends(get_storage_provider),
):
    # Simple authorization: storage_key must start with the caller's user_id
    if not audio_id.startswith(f"{user_id}/"):
        raise HTTPException(status_code=403, detail="Access denied")
    content = await storage.get_file(audio_id)
    duration = compute_speech_duration(content)
    return {"speech_duration_seconds": duration}


@app.post("/upload", response_model=UploadResponse)
async def upload_audio(
    file: UploadFile = File(...),
    user_id: str = Header(..., alias="X-User-Id"),
    storage: IStorageProvider = Depends(get_storage_provider),
):
    validate_file(file)
    # Sanitize filename
    filename = os.path.basename(file.filename)
    storage_key = f"{user_id}/{uuid.uuid4()}_{filename}"
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    await storage.store_file(storage_key, content, file.content_type)
    signed_url = await storage.get_signed_url(storage_key, expires_in=3600)
    return UploadResponse(storage_key=storage_key, signed_url=signed_url)

@app.post("/process/{audio_id:path}", response_model=ProcessResponse)
async def process_audio(
    audio_id: str,
    user_id: str = Header(..., alias="X-User-Id"),
    storage: IStorageProvider = Depends(get_storage_provider),
    stt: ISTTProvider = Depends(get_stt_provider),
):
    # Simple authorization: storage_key must start with user_id prefix
    if not audio_id.startswith(f"{user_id}/"):
        raise HTTPException(status_code=403, detail="Access denied")
    content = await storage.get_file(audio_id)
    try:
        transcript = await stt.transcribe(content)
    except Exception as e:
        # Convert any STT failure into a 500 response – caller sees generic message
        raise HTTPException(status_code=500, detail="STT processing error")
    return ProcessResponse(transcript=transcript)


@app.post("/metrics", response_model=MetricsResponse)
async def analyze_metrics_endpoint(transcript: str):
    metrics = compute_delivery_metrics(transcript)
    return MetricsResponse(**metrics)
