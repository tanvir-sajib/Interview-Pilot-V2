import { Test, TestingModule } from '@nestjs/testing';
import { UsageService } from '../src/modules/usage/usage.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsageType } from '@prisma/client';

jest.mock('../src/prisma/prisma.service');

describe('UsageService', () => {
  let service: UsageService;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageService,
        {
          provide: PrismaService,
          useValue: {
            usageRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsageService>(UsageService);
    prismaMock = module.get<PrismaService>(PrismaService) as any;
  });

  it('should create a ledger entry (append‑only)', async () => {
    const userId = 'user-1';
    const type = UsageType.SPEECH_DURATION as any;
    const amount = 1;
    await service.recordUsage(userId, type, amount);
    expect(prismaMock.usageRecord.create).toHaveBeenCalledWith({
      data: {
        userId,
        type,
        amount,
      },
    });
  });
});
