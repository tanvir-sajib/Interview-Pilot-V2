import { connection, isProcessed, markProcessed } from '../src/queues/audio-queue';
import { v4 as uuidv4 } from 'uuid';

describe('Audio job deduplication', () => {
  it('marks audio as processed and detects processed flag', async () => {
    const audioId = uuidv4();
    // Initially not processed
    const initially = await isProcessed(audioId);
    expect(initially).toBe(false);
    // Mark processed
    await markProcessed(audioId);
    const after = await isProcessed(audioId);
    expect(after).toBe(true);
    // No explicit cleanup needed; in-memory set is scoped per test run.
  });
});
