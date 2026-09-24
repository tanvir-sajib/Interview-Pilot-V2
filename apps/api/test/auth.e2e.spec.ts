import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

class MockPrismaService {
  private users: any[] = [];
  user = {
    findUnique: async (args: any) => {
      const user = this.users.find(u => (args.where?.email && u.email === args.where.email) || (args.where?.id && u.id === args.where.id));
      if (!user) return null;
      if (args.include?.profile) {
        return { ...user, profile: user.profile ?? { id: uuidv4() } };
      }
      return user;
    },
    create: async (args: any) => {
      const newUser = { id: uuidv4(), ...args.data, profile: args.data.profile?.create ? { id: uuidv4() } : undefined };
      this.users.push(newUser);
      return newUser;
    },
    deleteMany: async () => {
      this.users = [];
      return { count: 0 };
    },
    update: async (args: any) => {
      const user = this.users.find(u => u.id === args.where.id);
      if (!user) throw new Error('User not found');
      if (args.data.password !== undefined) user.password = args.data.password;
      if (args.data.failedLoginAttempts !== undefined) user.failedLoginAttempts = args.data.failedLoginAttempts;
      if (args.data.lockedUntil !== undefined) user.lockedUntil = args.data.lockedUntil;
      if (args.data.role !== undefined) user.role = args.data.role;
      if (args.data.isActive !== undefined) user.isActive = args.data.isActive;
      if (args.data.profile?.create !== undefined) {
        user.profile = user.profile ?? { id: uuidv4() };
      }
      if (args.data.profile?.update !== undefined) {
        user.profile = { ...user.profile, ...args.data.profile.update };
      }
      if (args.include?.profile) {
        return { ...user, profile: user.profile ?? { id: uuidv4() } };
      }
      return user;
    },
  };
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;

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
