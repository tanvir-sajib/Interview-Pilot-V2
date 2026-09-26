import { Queue, ConnectionOptions, Redis } from 'bullmq';
import { createClient } from 'redis';
import { promises as fs } from 'fs';
import { resolve } from 'path';

export type AudioJobData = { audioId: string; path: string };

const redisOptions: ConnectionOptions = { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 };
const connection = new Redis(redisOptions);

export const audioQueue = new Queue<AudioJobData>('audio', { connection });

export async function isProcessed(audioId: string): Promise<boolean> {
  const key = `audio:processed:${audioId}`;
  const exists = await connection.exists(key);
  return exists === 1;
}

export async function markProcessed(audioId: string): Promise<void> {
  const key = `audio:processed:${audioId}`;
  // Set a TTL of one day so stale records don’t accumulate
  await connection.set(key, '1', 'EX', 60 * 60 * 24);
}

export async function enqueueAudioJob(audioId: string, path: string): Promise<void> {
  await audioQueue.add('process', { audioId, path });
}
