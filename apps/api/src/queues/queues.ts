import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

// Queue names matching the spec
export const QUEUE_NAMES = {
  STT_PROCESS: "stt.process",
  LLM_EVALUATE: "llm.evaluate",
  DELIVERY_ANALYZE: "delivery.analyze",
  SESSION_SUMMARIZE: "session.summarize",
  NOTIFICATION_SEND: "notification.send",
};

// Helper to instantiate a queue with default connection
export function createQueue(name: string) {
  return new Queue(name, { connection: getRedisConnection() });
}

// Example: initialise all queues at startup
export const queues = Object.values(QUEUE_NAMES).map(createQueue);
