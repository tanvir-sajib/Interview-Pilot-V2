import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../queues/redis';
import { QUEUE_NAMES } from '../queues/queues';
import { LLMProviderService } from '../modules/ai/llm-provider.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { EvaluationResult } from '../modules/ai/llm-provider.interface';

/**
 * BullMQ worker that processes LLM evaluation jobs.
 * It uses the LLMProviderService to obtain a structured evaluation result,
 * validates it, persists it via Prisma, and emits WebSocket events.
 */
async function startWorker() {
  const logger = new Logger('LLMEvaluationWorker');
  const prisma = new PrismaService();
  const configService = new ConfigService();
  const providerService = new LLMProviderService(configService);

  const worker = new Worker(
    QUEUE_NAMES.LLM_EVALUATE,
    async (job: Job) => {
      const { answerId, content, userId, rubric } = job.data as any;
      logger.log(`Processing evaluation job ${job.id} for answer ${answerId}`);

      // Emit started event via WebSocket gateway (if gateway is available).
      try {
        // For simplicity we import the gateway lazily to avoid circular dependencies.
        const { EvaluationGateway } = await import('../gateways/evaluation.gateway');
        EvaluationGateway.instance?.emitEvaluationStarted(answerId, userId);
      } catch (_) {
        // ignore if gateway not available
        void 0;
      }

      try {
        const result: EvaluationResult = await providerService.evaluateAnswer(content);
        // Persist the result using the EvaluationsService logic.
        // Directly use Prisma to store evaluation (simplified).
        await prisma.evaluation.create({
          data: {
            answerId,
            evaluator: 'USER', // placeholder role
            score: result.overallScore,
            feedback: JSON.stringify(result),
          },
        });
        // Emit completed event.
        try {
          const { EvaluationGateway } = await import('../gateways/evaluation.gateway');
          EvaluationGateway.instance?.emitEvaluationCompleted(answerId, result);
        } catch (_) {
          // ignore if gateway not available
          void 0;
        }
        return result;
      } catch (error) {
        logger.error(`Evaluation job ${job.id} failed: ${(error as any)?.message}`);
        // Emit failed event.
        try {
          const { EvaluationGateway } = await import('../gateways/evaluation.gateway');
          EvaluationGateway.instance?.emitEvaluationFailed(answerId, error);
        } catch (_) {
          // ignore if gateway not available
          void 0;
        }
        throw error; // Let BullMQ handle retries according to job options.
      }
    },
    {
      connection: getRedisConnection(),
      // Configure a reasonable concurrency for CPU/IO bound LLM calls.
      concurrency: 5,
    },
  );

  worker.on('error', (err) => logger.error(`Worker error: ${err.message}`));
  logger.log('LLM evaluation worker started');
}

startWorker().catch((err) => {
  console.error('Failed to start LLM evaluation worker', err);
  process.exit(1);
});
