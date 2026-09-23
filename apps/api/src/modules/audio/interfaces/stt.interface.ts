export const STT_PROVIDER_TOKEN = 'ISTTProvider';

export interface ISTTProvider {
  /**
   * Transcribe an audio file located at the provided URL.
   * Returns the raw transcript text.
   */
  transcribe(audioUrl: string): Promise<string>;
}
