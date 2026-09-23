import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Queue, JobsOptions } from 'bullmq';
import { createQueue, QUEUE_NAMES } from '../../queues/queues';
import { LLMProviderService } from '../ai/llm-provider.service';
import { EvaluationResult } from '../ai/llm-provider.interface';
import { ConfigService } from '@nestjs/config';

/**
 * EvaluationsService handles the orchestration of the AI evaluation pipeline.
 * It enqueues evaluation jobs, validates results, and stores structured data.
 */
@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);
  private readonly evalQueue: Queue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmProvider: LLMProviderService,
    private readonly config: ConfigService,
  ) {
    // Initialise the BullMQ queue for LLM evaluation jobs.
    this.evalQueue = createQueue(QUEUE_NAMES.LLM_EVALUATE);
  }

  /**
   * Enqueue an evaluation job for a specific answer.
   * Returns the BullMQ job ID (string) which can be used for tracking.
   */
  async enqueueEvaluation(answerId: string, userId: string): Promise<string> {
    // Fetch answer content to include in the job payload.
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { sessionQuestion: { include: { question: true } } },
    });
    if (!answer) {
      throw new Error(`Answer ${answerId} not found`);
    }

    const payload = {
      answerId: answer.id,
      content: answer.content,
      userId,
      // Include any contextual metadata needed for evaluation (e.g., question rubric).
      rubric: answer.sessionQuestion?.question?.rubric,
    };

    const jobOpts: JobsOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      // Prevent blocking the API for long-running evaluations.
      removeOnComplete: true,
      removeOnFail: false,
    };

    const job = await this.evalQueue.add('evaluate', payload, jobOpts);
    this.logger.log(`Enqueued LLM evaluation job ${job.id} for answer ${answerId}`);
    return job.id as string;
  }

  /**
   * Process a completed evaluation (called by the worker).
   * Validates the result against the strict schema and persists it.
   */
  async handleEvaluationResult(answerId: string, result: EvaluationResult, providerMeta: any) {
    // Validate fields – simple runtime checks.
    const requiredFields = [
      'overallScore',
      'correctness',
      'completeness',
      'technicalDepth',
      'structure',
      'communication',
      'strengths',
      'weaknesses',
      'missingConcepts',
      'improvementTips',
      'confidence',
      'provider',
      'model',
    ];
    for (const f of requiredFields) {
      if (result[f as keyof EvaluationResult] === undefined) {
        throw new Error(`Evaluation result missing required field ${f}`);
      }
    }

    // Persist the evaluation. We store the structured result as JSON in the `feedback` column for now.
    const feedbackJson = JSON.stringify(result);
    await this.prisma.evaluation.create({
      data: {
        answerId,
        evaluator: providerMeta.evaluatorRole ?? 'USER', // placeholder – real role mapping can be added later.
        score: result.overallScore,
        feedback: feedbackJson,
      },
    });
    this.logger.log(`Stored evaluation for answer ${answerId}`);
  }
}

