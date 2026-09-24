import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from stt import DummySTTProvider
import asyncio

def test_dummy_stt_provider():
    provider = DummySTTProvider()
    transcript = asyncio.run(provider.transcribe(b"dummy audio"))
    assert transcript == "dummy transcript"
