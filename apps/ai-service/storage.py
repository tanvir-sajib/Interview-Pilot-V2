import abc
from typing import Any

class IStorageProvider(abc.ABC):
    @abc.abstractmethod
    async def store_file(self, key: str, data: bytes, content_type: str) -> None:
        """Store a file under the given key."""
        ...

    @abc.abstractmethod
    async def get_file(self, key: str) -> bytes:
        """Retrieve a file's bytes by its key."""
        ...

    @abc.abstractmethod
    async def get_signed_url(self, key: str, expires_in: int) -> str:
        """Return a signed URL (or placeholder) for the stored object."""
        ...

# Local dev stub implementation (non‑S3, for development & testing only)
import os
import aiofiles

class LocalStorageProvider(IStorageProvider):
    def __init__(self, base_dir: str = "./storage"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def store_file(self, key: str, data: bytes, content_type: str) -> None:
        path = os.path.join(self.base_dir, key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        async with aiofiles.open(path, "wb") as f:
            await f.write(data)

    async def get_file(self, key: str) -> bytes:
        path = os.path.join(self.base_dir, key)
        async with aiofiles.open(path, "rb") as f:
            return await f.read()

    async def get_signed_url(self, key: str, expires_in: int) -> str:
        # In a real S3 setup this would generate a presigned URL; we return a file URI for local storage.
        path = os.path.abspath(os.path.join(self.base_dir, key))
        return f"file://{path}"

def get_storage_provider() -> IStorageProvider:
    # Choose implementation via environment variable STORAGE_PROVIDER (default: local)
    import os as _os
    provider = _os.getenv("STORAGE_PROVIDER", "local")
    if provider == "local":
        return LocalStorageProvider()
    # Future providers such as S3StorageProvider can be added here.
    raise NotImplementedError(f"Storage provider '{provider}' is not implemented")
