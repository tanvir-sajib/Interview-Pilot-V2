import { Test, TestingModule } from '@nestjs/testing';
import { UsageService, UsageType } from '../src/modules/usage/usage.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

jest.mock('../src/prisma/prisma.service');

describe('UsageService', () => {
  let service: UsageService;
  let prismaMock: any;

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
              aggregate: jest.fn(),
            },
            subscription: {
              findFirst: jest.fn(),
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
    prismaMock.subscription.findFirst.mockResolvedValue({ usageLimit: 100, status: SubscriptionStatus.ACTIVE });
    prismaMock.usageRecord.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    await service.recordUsage(userId, type, amount);
    expect(prismaMock.usageRecord.create).toHaveBeenCalledWith({
      data: { userId, type, amount },
    });
  });

  it('rejects usage when no active subscription', async () => {
    const userId = 'user-2';
    const type = UsageType.AI_CALLS as any;
    const amount = 5;
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    await expect(service.recordUsage(userId, type, amount)).rejects.toThrow('No active subscription');
  });

  it('rejects usage when limit exceeded', async () => {
    const userId = 'user-3';
    const type = UsageType.SPEECH_DURATION as any;
    const amount = 10;
    prismaMock.subscription.findFirst.mockResolvedValue({ usageLimit: 5, status: SubscriptionStatus.ACTIVE });
    prismaMock.usageRecord.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    await expect(service.recordUsage(userId, type, amount)).rejects.toThrow('Usage limit exceeded');
  });
});
