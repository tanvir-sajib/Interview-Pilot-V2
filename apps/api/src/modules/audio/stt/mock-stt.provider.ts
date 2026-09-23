import { Injectable } from '@nestjs/common';
import { ISTTProvider } from '../interfaces/stt.interface';

/**
 * Mock STT provider that returns a deterministic transcript for any audio URL.
 */
@Injectable()
export class MockSTTProvider implements ISTTProvider {
  async transcribe(audioUrl: string): Promise<string> {
    // In a real implementation this would call an external Whisper/ASR service.
    // For now we return a fixed placeholder transcript.
    return `Transcribed text for ${audioUrl}`;
  }
}
