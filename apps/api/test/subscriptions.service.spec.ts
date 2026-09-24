import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { SubscriptionStatus } from '@prisma/client';

jest.mock('../src/prisma/prisma.service');

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              create: jest.fn().mockResolvedValue({ id: 'sub-1', userId: 'user-1', status: 'PENDING' }),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: AuditService,
          useValue: { record: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prismaMock = module.get<PrismaService>(PrismaService) as any;
    auditMock = module.get<AuditService>(AuditService) as any;
  });

  it('creates a subscription and records audit', async () => {
    await service.createSubscription('user-1');
    expect(prismaMock.subscription.create).toHaveBeenCalled();
    expect(auditMock.record).toHaveBeenCalledWith(null, 'CREATE_SUBSCRIPTION', expect.objectContaining({ userId: 'user-1' }));
  });

  it('activates an expired subscription (status changes to ACTIVE)', async () => {
    prismaMock.subscription.update.mockResolvedValue({ id: 'sub-1', status: SubscriptionStatus.ACTIVE });
    await service.activateSubscription('sub-1');
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { status: SubscriptionStatus.ACTIVE, startDate: expect.any(Date) },
    });
    expect(auditMock.record).toHaveBeenCalledWith(null, 'ACTIVATE_SUBSCRIPTION', { subscriptionId: 'sub-1' });
  });
});
