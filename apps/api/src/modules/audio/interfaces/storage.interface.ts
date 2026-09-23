export const STORAGE_PROVIDER_TOKEN = 'IStorageProvider';

export interface IStorageProvider {
  /** Generate a signed URL for uploading a file with the given filename */
  generateUploadUrl(filename: string): Promise<string>;

  /** Generate a signed URL for downloading a stored object by its key */
  generateDownloadUrl(key: string): Promise<string>;

  /** Validate the file before uploading (size, MIME, etc.) */
  validateFile(filename: string, size: number, mimeType: string): void;
}
