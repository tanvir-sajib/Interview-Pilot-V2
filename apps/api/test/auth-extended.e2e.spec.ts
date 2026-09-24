import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { MockPrismaService } from './auth.e2e.spec'; // reuse mock definition

/**
 * Auth e2e tests extended with refresh‑token rotation verification and password‑change edge cases.
 */

describe('Auth (e2e) extended', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let oldRefreshToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '10s';
    process.env.REFRESH_EXPIRES_IN = '1h';
    process.env.BCRYPT_SALT_ROUNDS = '8';

    const mockPrismaService = new MockPrismaService();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
    app = module.createNestApplication();
    await app.init();
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'user@example.com', password: 'Password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should login with registered user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'Password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPass' });
    expect(res.status).toBe(401);
  });

  it('should refresh token and rotate version', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    // keep old token for next test
    oldRefreshToken = refreshToken;
    refreshToken = res.body.refreshToken;
    accessToken = res.body.accessToken;
  });

  it('should reject reuse of old refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefreshToken });
    expect(res.status).toBe(401);
  });

  it('should access protected endpoint with fresh token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'user@example.com');
  });

  it('should change password with correct current password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'Password123', newPassword: 'NewPass456' });
    expect(res.status).toBe(200);
  });

  it('should reject password change with wrong current password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'WrongOld', newPassword: 'AnotherPass' });
    expect(res.status).toBe(401);
  });

  it('old access token should still be valid after password change', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'user@example.com');
  });
});
