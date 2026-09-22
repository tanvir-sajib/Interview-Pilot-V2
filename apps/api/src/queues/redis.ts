import Redis from 'ioredis';

/**
 * Returns a shared ioredis client configured from REDIS_URL (or defaults to localhost).
 * The client is ready to be passed directly to BullMQ Queue constructors.
 */
export function getRedisConnection(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = new Redis(url);
  client.on('error', (err) => console.error('Redis Client Error', err));
  return client;
}

