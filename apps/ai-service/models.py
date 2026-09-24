from pydantic import BaseModel

class UploadResponse(BaseModel):
    storage_key: str
    signed_url: str

class ProcessResponse(BaseModel):
    transcript: str

class MetricsResponse(BaseModel):
    speech_duration: str
    speaking_rate: str
    pause_duration: str
    long_pause_detection: str
    filler_frequency: str
    speech_consistency: str
