import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Swagger OpenAPI', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => key === 'JWT_SECRET' ? 'test-secret' : undefined })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should expose Swagger docs at /api/v1/docs', async () => {
    const resp = await request(app.getHttpServer())
      .get('/api/v1/docs')
      .expect(200);
    expect(resp.body).toHaveProperty('paths');
    expect(resp.body.paths).toHaveProperty('/auth/register');
    expect(resp.body.paths).toHaveProperty('/users/me');
  });
});