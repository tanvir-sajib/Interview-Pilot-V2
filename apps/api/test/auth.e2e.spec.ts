import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '1s';
    process.env.REFRESH_EXPIRES_IN = '1h';
    process.env.BCRYPT_SALT_ROUNDS = '8';

    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
    prisma = module.get<PrismaService>(PrismaService);
    // Clean database
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should login with registered user', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'WrongPass',
    });
    expect(res.status).toBe(401);
  });

  it('should refresh token', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
  });

  it('should access protected endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'user@example.com');
  });

  it('should authorize admin role', async () => {
    // Create admin user
    const adminRes = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'admin@admin.example.com',
      password: 'AdminPass123',
    });
    const adminToken = adminRes.body.accessToken;
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/secret')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('secret');
  });

  it('should change password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'Password123', newPassword: 'NewPass456' });
    expect(res.status).toBe(200);
    // verify login with new password
    const loginRes = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'NewPass456',
    });
    expect(loginRes.status).toBe(200);
  });
});
