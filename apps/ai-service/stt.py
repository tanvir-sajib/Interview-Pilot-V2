import abc
from typing import Any

class ISTTProvider(abc.ABC):
    @abc.abstractmethod
    async def transcribe(self, audio_data: bytes) -> str:
        """Transcribe audio bytes into text."""
        ...

class DummySTTProvider(ISTTProvider):
    async def transcribe(self, audio_data: bytes) -> str:
        # Returns a deterministic placeholder transcript for testing.
        return "dummy transcript"

class FailingSTTProvider(ISTTProvider):
    async def transcribe(self, audio_data: bytes) -> str:
        raise RuntimeError('Transcription failed')

def get_stt_provider() -> ISTTProvider:
    import os as _os
    provider = _os.getenv("STT_PROVIDER", "dummy")
    if provider == "dummy":
        return DummySTTProvider()
    if provider == "failing":
        return FailingSTTProvider()
    # Future implementations (e.g., Whisper) can be added here.
    raise NotImplementedError(f"STT provider '{provider}' is not implemented")

