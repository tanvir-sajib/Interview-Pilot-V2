import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../src/modules/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('../src/prisma/prisma.service');

describe('AuditService', () => {
  let service: AuditService;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn().mockResolvedValue({ id: 'log-1', userId: 'user-1', action: 'TEST_ACTION', details: { foo: 'bar' } }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaMock = module.get<PrismaService>(PrismaService) as any;
  });

  it('records an audit entry without sensitive data', async () => {
    const result = await service.record('user-1', 'TEST_ACTION', { foo: 'bar' });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'TEST_ACTION',
        details: { foo: 'bar' },
      },
    });
    expect(result).toHaveProperty('id', 'log-1');
  });

  it('rejects audit details containing forbidden keys', async () => {
    await expect(service.record('user-1', 'BAD', { password: 'secret' })).rejects.toThrow(/must not contain sensitive key/);
  });
});
