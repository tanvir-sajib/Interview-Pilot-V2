import wave
import io

def compute_speech_duration(audio_bytes: bytes) -> float:
    """Compute duration (seconds) from a WAV audio byte stream.
    Returns 0.0 if the data cannot be parsed as a valid WAV file.
    """
    try:
        with wave.open(io.BytesIO(audio_bytes), 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            if rate == 0:
                return 0.0
            return frames / float(rate)
    except wave.Error:
        return 0.0

def compute_delivery_metrics(transcript: str) -> dict:
    """Compute delivery metrics from a transcript.
    Since we lack timing data here, most metrics are not reliably computable.
    """
    return {
        "speech_duration": "not reliably computable yet",
        "speaking_rate": "not reliably computable yet",
        "pause_duration": "not reliably computable yet",
        "long_pause_detection": "not reliably computable yet",
        "filler_frequency": "not reliably computable yet",
        "speech_consistency": "not reliably computable yet",
    }
