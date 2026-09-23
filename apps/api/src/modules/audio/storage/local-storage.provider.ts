import { Injectable } from '@nestjs/common';
import { IStorageProvider } from '../interfaces/storage.interface';
import { STORAGE_BUCKET } from '../constants';

/**
 * Simple local‑filesystem storage provider used for development/testing.
 * It pretends to generate signed URLs – in reality it returns a static path.
 */
@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  async generateUploadUrl(filename: string): Promise<string> {
    // In a real S3 implementation this would be a signed PUT URL.
    // Here we simply return a placeholder path that the client could PUT to.
    return `file://local-storage/${STORAGE_BUCKET}/${filename}`;
  }

  async generateDownloadUrl(key: string): Promise<string> {
    // Placeholder download URL.
    return `file://local-storage/${STORAGE_BUCKET}/${key}`;
  }

  validateFile(filename: string, size: number, mimeType: string): void {
    // Basic validation – enforce size limit and allowed mime types.
    const maxSize = 500 * 1024 * 1024; // 500 MiB
    if (size > maxSize) {
      throw new Error('File size exceeds limit');
    }
    const allowed = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/webm',
    ];
    if (!allowed.includes(mimeType)) {
      throw new Error('Unsupported audio type');
    }
  }
}
