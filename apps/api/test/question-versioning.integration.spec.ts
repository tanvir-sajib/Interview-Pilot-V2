import { Test } from '@nestjs/testing';
import { QuestionsService } from '../src/modules/questions/questions.service';
import { PrismaClient } from '@prisma/client';
import { QuestionRole, QuestionSeniority, QuestionCategory, QuestionDifficulty, QuestionLanguage } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Question versioning integration', () => {
  let service: QuestionsService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({
      providers: [QuestionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(QuestionsService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a question and successive updates produce new immutable versions', async () => {
    const createDto = {
      title: 'Sample Q',
      text: 'Initial text',
      tags: ['sample'],
      role: QuestionRole.TECHNICAL,
      seniority: QuestionSeniority.MID,
      category: QuestionCategory.TECHNICAL,
      difficulty: QuestionDifficulty.EASY,
      expectedConcepts: ['sample'],
      rubric: 'rubric',
      language: QuestionLanguage.EN,
    };

    const q = await service.createQuestion(createDto);
    const versions1 = await service.listVersions(q.id);
    expect(versions1).toHaveLength(1);
    expect(versions1[0].content).toEqual('Initial text');

    // Update text
    await service.updateQuestion(q.id, { text: 'Updated text' });
    const versions2 = await service.listVersions(q.id);
    expect(versions2).toHaveLength(2);
    const sorted = versions2.sort((a, b) => a.versionNumber - b.versionNumber);
    expect(sorted[0].content).toEqual('Initial text');
    expect(sorted[1].content).toEqual('Updated text');
  });
});