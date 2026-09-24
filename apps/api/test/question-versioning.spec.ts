import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from '../src/modules/questions/questions.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { QuestionStatus, Role } from '@prisma/client';

/**
 * Minimal mock Prisma for question versioning tests.
 */
class MockPrismaService {
  private questions: any[] = [];
  private versions: any[] = [];

  question = {
    findUnique: async (args: any) => {
      const q = this.questions.find((q) => q.id === args.where.id);
      if (!q) return null;
      return { ...q, versions: this.versions.filter(v => v.questionId === q.id) };
    },
    create: async (args: any) => {
      const q = { id: args.data.id ?? 'q-' + Math.random().toString(36).substr(2, 5), ...args.data };
      this.questions.push(q);
      return q;
    },
    update: async (args: any) => {
      const q = this.questions.find((q) => q.id === args.where.id);
      if (!q) throw new Error('Question not found');
      Object.assign(q, args.data);
      return q;
    },
  };

  questionVersion = {
    create: async (args: any) => {
      const v = { id: 'v-' + Math.random().toString(36).substr(2, 5), ...args.data };
      this.versions.push(v);
      return v;
    },
    findFirst: async (args: any) => {
      const filtered = this.versions.filter(v => v.questionId === args.where.questionId);
      if (args.orderBy?.versionNumber === 'desc') {
        filtered.sort((a, b) => b.versionNumber - a.versionNumber);
      }
      return filtered[0] ?? null;
    },
    findMany: async (args: any) => {
      return this.versions.filter(v => v.questionId === args.where.questionId);
    },
  };
}

describe('Question versioning', () => {
  let service: QuestionsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = new MockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<QuestionsService>(QuestionsService);
  });

  it('creates initial version on question creation', async () => {
    const dto = {
      title: 'Q1',
      text: 'Explain closures.',
      tags: [],
      role: 'TECHNICAL',
      seniority: 'MID',
      category: 'TECHNICAL',
      difficulty: 'EASY',
      expectedConcepts: [],
      rubric: 'Rubric',
      language: 'EN',
    } as any;
    const q = await service.createQuestion(dto);
    expect(q).toBeDefined();
    // After creation there should be exactly one version with versionNumber 1
    const versions = await service.listVersions(q.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].versionNumber).toBe(1);
  });

  it('adds a new version on update without mutating prior version', async () => {
    const createDto = {
      title: 'Q2',
      text: 'Original text',
      tags: [],
      role: 'TECHNICAL',
      seniority: 'MID',
      category: 'TECHNICAL',
      difficulty: 'EASY',
      expectedConcepts: [],
      rubric: 'Rubric',
      language: 'EN',
    } as any;
    const q = await service.createQuestion(createDto);
    // Update text
    const updateDto = { text: 'Updated text' } as any;
    await service.updateQuestion(q.id, updateDto);
    const versions = await service.listVersions(q.id);
    expect(versions).toHaveLength(2);
    const sorted = versions.sort((a, b) => a.versionNumber - b.versionNumber);
    expect(sorted[0].content).toBe('Original text');
    expect(sorted[1].content).toBe('Updated text');
    expect(sorted[1].versionNumber).toBe(2);
  });
});
