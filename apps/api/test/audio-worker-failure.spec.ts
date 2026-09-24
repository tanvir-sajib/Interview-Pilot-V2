import * as audioWorkerModule from '../src/workers/audio-worker';
import { Job } from 'bullmq';

describe('Audio worker failure handling', () => {
  it('propagates error from STT provider', async () => {
    // Override transcribe implementation to throw
    audioWorkerModule.setTranscribeFn(async () => {
      throw new Error('STT error');
    });
    const job = { data: { audioId: 'test-id' } } as Job<any>;
    await expect(audioWorkerModule.audioProcessor(job)).rejects.toThrow('STT error');
    // Reset to default implementation for other tests
    audioWorkerModule.setTranscribeFn(async () => 'dummy transcript');
  });
});
