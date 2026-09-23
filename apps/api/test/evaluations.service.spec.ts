import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsService } from '../src/modules/evaluations/evaluations.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { EvaluationResult } from '../src/modules/ai/llm-provider.interface';
import { LLMProviderService } from '../src/modules/ai/llm-provider.service';
import { ConfigService } from '@nestjs/config';

jest.mock('../src/prisma/prisma.service');

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let prismaMock: jest.Mocked<PrismaService>;
  let llmProviderMock: Partial<LLMProviderService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: PrismaService,
          useValue: {
            evaluation: { create: jest.fn() },
            answer: { findUnique: jest.fn() },
          },
        },
        {
          provide: LLMProviderService,
          useValue: {
            evaluateAnswer: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
    prismaMock = module.get<PrismaService>(PrismaService) as any;
    llmProviderMock = module.get<LLMProviderService>(LLMProviderService) as any;
  });

  it('should store a valid evaluation result', async () => {
    const result: EvaluationResult = {
      overallScore: 85,
      correctness: 90,
      completeness: 80,
      technicalDepth: 75,
      structure: 80,
      communication: 88,
      strengths: ['Clear'],
      weaknesses: ['Missing details'],
      missingConcepts: ['X'],
      improvementTips: ['Improve Y'],
      confidence: 0.9,
      provider: 'mock',
      model: 'mock-model',
    };

    await service.handleEvaluationResult('answer-123', result, {});
    expect(prismaMock.evaluation.create).toHaveBeenCalledWith({
      data: {
        answerId: 'answer-123',
        evaluator: 'USER',
        score: result.overallScore,
        feedback: JSON.stringify(result),
      },
    });
  });

  it('should reject malformed evaluation result', async () => {
    const malformed: any = { overallScore: 85 }; // missing many fields
    await expect(service.handleEvaluationResult('answer-123', malformed, {})).rejects.toThrow(
      /Evaluation result missing required field/,
    );
  });
});
