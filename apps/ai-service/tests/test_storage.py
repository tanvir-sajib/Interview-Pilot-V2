import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
import uuid
import os
from storage import LocalStorageProvider


def test_local_storage_provider(tmp_path):
    provider = LocalStorageProvider(base_dir=str(tmp_path))
    key = f"test/{uuid.uuid4()}.wav"
    data = b"audio bytes"
    # Store
    asyncio.run(provider.store_file(key, data, "audio/wav"))
    # Retrieve
    retrieved = asyncio.run(provider.get_file(key))
    assert retrieved == data
    # Signed URL contains file://
    url = asyncio.run(provider.get_signed_url(key, expires_in=3600))
    assert url.startswith("file://")
    # Ensure file exists on disk
    assert os.path.isfile(os.path.join(str(tmp_path), key))
