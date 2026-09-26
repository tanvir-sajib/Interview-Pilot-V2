import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth e2e (real flow)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use a temporary SQLite DB file for testing to avoid requiring PostgreSQL
    prisma = new PrismaClient();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })

// ...
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => key === 'JWT_SECRET' ? 'test-secret' : undefined })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should register, login, refresh, and access protected route', async () => {
    // Register a new user
    const registerResp = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'testuser@example.com', password: 'TestPass123' })
      .expect(201);
    const { accessToken, refreshToken } = registerResp.body;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Use access token to get user profile
    const meResp = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(meResp.body.email).toEqual('testuser@example.com');

    // Refresh token and get new tokens
    const refreshResp = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    const newTokens = refreshResp.body;
    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.refreshToken).toBeDefined();

    // Old refresh token should now be invalid
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    // Use new access token to access protected route
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${newTokens.accessToken}`)
      .expect(200);
  });
});