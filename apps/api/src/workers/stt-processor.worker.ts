import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../queues/redis';
import { QUEUE_NAMES } from '../queues/queues';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { IStorageProvider } from '../modules/audio/interfaces/storage.interface';
import { ISTTProvider } from '../modules/audio/interfaces/stt.interface';
import { LocalStorageProvider } from '../modules/audio/storage/local-storage.provider';
import { MockSTTProvider } from '../modules/audio/stt/mock-stt.provider';

/**
 * Worker that processes STT jobs: fetches audio via storage, transcribes, and enqueues LLM evaluation.
 */
async function startSttWorker() {
  const logger = new Logger('STTProcessorWorker');
  const prisma = new PrismaService();
  // const configService = new ConfigService(); // No config needed currently
  const storageProvider: IStorageProvider = new LocalStorageProvider();
  const sttProvider: ISTTProvider = new MockSTTProvider();

  const worker = new Worker(
    QUEUE_NAMES.STT_PROCESS,
    async (job: Job) => {
      const { answerId, audioKey } = job.data as any;
      logger.log(`Processing STT for answer ${answerId}, key ${audioKey}`);

      // Generate a download URL (mock) and transcribe.
      const audioUrl = await storageProvider.generateDownloadUrl(audioKey);
      const transcript = await sttProvider.transcribe(audioUrl);

      // For simplicity, store transcript directly on answer (could be a separate model).
      await prisma.answer.update({
        where: { id: answerId },
        data: { content: transcript },
      });

      // Enqueue LLM evaluation after transcript is ready.
      const evalQueue = (await import('../queues/queues')).createQueue(QUEUE_NAMES.LLM_EVALUATE);
      await evalQueue.add('evaluate', { answerId, content: transcript, userId: job.data.userId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
    },
    {
      connection: getRedisConnection(),
      concurrency: 3,
    },
  );

  worker.on('error', (err) => logger.error(`STT worker error: ${err.message}`));
  logger.log('STT processor worker started');
}

startSttWorker().catch((err) => {
  console.error('Failed to start STT worker', err);
  process.exit(1);
});
