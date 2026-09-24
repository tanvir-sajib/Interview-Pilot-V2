import { Worker, Job, Processor } from 'bullmq';
import { connection, isProcessed, markProcessed, AudioJobData } from '../queues/audio-queue';

// ---- STT abstraction for the worker ----
// By default a deterministic dummy implementation is used. Tests can replace it via setTranscribeFn.
let transcribeFn = async (_audioId: string): Promise<string> => {
  // Simulate deterministic result
  return 'dummy transcript';
};

/** Exported for production – the worker calls this. */
export async function transcribeAudio(_audioId: string): Promise<string> {
  return transcribeFn(_audioId);
}

/** Test helper – swap the implementation (e.g. to throw). */
export function setTranscribeFn(fn: (audioId: string) => Promise<string>) {
  transcribeFn = fn;
}

export const audioProcessor: Processor<AudioJobData> = async (job: Job<AudioJobData>) => {
  const { audioId } = job.data;
  // Idempotency: skip if already processed
  if (await isProcessed(audioId)) {
    return { skipped: true };
  }
  // Simulate STT processing via transcribeAudio (which may be overridden in tests)
  const transcript = await transcribeAudio(audioId);
  // Here we could enqueue a delivery analysis job; omitted for brevity.
  await markProcessed(audioId);
  return { transcript, skipped: false };
};

export const audioWorker = new Worker('audio', audioProcessor, {
  connection,
});
