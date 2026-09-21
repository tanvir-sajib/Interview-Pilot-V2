import { createClient, RedisClientType } from 'redis';

export function getRedisConnection(): RedisClientType {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis Client Error', err));
  return client;
}
