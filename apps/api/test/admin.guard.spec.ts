import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from '../src/modules/admin/admin.controller';
import { RolesGuard } from '../src/modules/auth/roles.guard';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Mock PrismaService to avoid real DB calls.
 */
class MockPrismaService {
  user = { findMany: jest.fn().mockResolvedValue([]) } as any;
  subscription = { findMany: jest.fn().mockResolvedValue([]) } as any;
  payment = { findMany: jest.fn().mockResolvedValue([]) } as any;
  usageRecord = { findMany: jest.fn().mockResolvedValue([]) } as any;
  auditLog = { findMany: jest.fn().mockResolvedValue([]) } as any;
}

/**
 * Helper to create an app with a given mocked user role.
 */
function createAppWithRole(role: string): Promise<INestApplication> {
  const mockJwtGuard = {
    canActivate: (ctx: any) => {
      const request = ctx.switchToHttp().getRequest();
      request.user = { role };
      return true;
    },
  };

  return Test.createTestingModule({
    controllers: [AdminController],
    providers: [RolesGuard, { provide: PrismaService, useClass: MockPrismaService }],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtGuard)
    .compile()
    .then((moduleRef: TestingModule) => {
      const app = moduleRef.createNestApplication();
      return app.init().then(() => app);
    });
}

describe('RolesGuard integration (admin secret endpoint)', () => {
  it('returns 403 for USER role', async () => {
    const app = await createAppWithRole('USER');
    await request(app.getHttpServer())
      .get('/api/v1/admin/secret')
      .expect(HttpStatus.FORBIDDEN);
    await app.close();
  });

  it('returns 200 and secret for ADMIN role', async () => {
    const app = await createAppWithRole('ADMIN');
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/secret')
      .expect(HttpStatus.OK);
    expect(response.body).toEqual({ secret: 'Only admin can see this' });
    await app.close();
  });
});
