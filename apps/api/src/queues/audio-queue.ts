import IORedis from 'ioredis';
import { Queue } from 'bullmq';

export const connection = new IORedis();

export const audioQueue = new Queue('audio', { connection });

export interface AudioJobData {
  audioId: string;
  userId: string;
  storageKey: string;
}

// Simple in‑memory deduplication when a real Redis server is unavailable (e.g., during tests)
const processedSet = new Set<string>();

export async function isProcessed(audioId: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') {
    return processedSet.has(audioId);
  }
  const val = await connection.get(`audio:processed:${audioId}`);
  return val === '1';
}

export async function markProcessed(audioId: string): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    processedSet.add(audioId);
    return;
  }
  // Keep processed flag for 24h
  await connection.set(`audio:processed:${audioId}`, '1', 'EX', 60 * 60 * 24);
}
