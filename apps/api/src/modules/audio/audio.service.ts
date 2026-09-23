import { Injectable, Inject } from '@nestjs/common';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from './interfaces/storage.interface';

/**
 * AudioService orchestrates storage interactions for audio uploads.
 */
@Injectable()
export class AudioService {
  constructor(@Inject(STORAGE_PROVIDER_TOKEN) private readonly storageProvider: IStorageProvider) {}

  async getSignedUploadUrl(filename: string): Promise<string> {
    // Delegate to storage provider; in a real system this would generate a signed URL.
    return this.storageProvider.generateUploadUrl(filename);
  }
}
