import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

/**
 * Simple unit tests for AuthService covering registration and login flows.
 * PrismaService is fully mocked – no real DB connection is required.
 */

describe('AuthService', () =>n{
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let config: ConfigService;
  let jwt: JwtService;

  beforeAll(() => {
    // Minimal env for AuthService
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.REFRESH_EXPIRES_IN = '7d';
    process.env.BCRYPT_SALT_ROUNDS = '4'; // low rounds for speed
  });

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    config = new ConfigService();
    jwt = new JwtService({ secret: process.env.JWT_SECRET });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: PrismaService, useValue: prisma }, { provide: ConfigService, useValue: config }, { provide: JwtService, useValue: jwt }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user when email is not taken', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'uid-123',
      email: 'new@example.com',
      password: await bcrypt.hash('password', 4),
      role: 'USER',
      profileId: 'pid',
    } as any);

    const result = await service.register('new@example.com', 'password');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('throws when registering with an existing email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'uid', email: 'exist@example.com' } as any);
    await expect(service.register('exist@example.com', 'pass')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in successfully with correct credentials', async () => {
    const hashed = await bcrypt.hash('secret', 4);
    prisma.user.findUnique.mockResolvedValue({
      id: 'uid-2',
      email: 'login@example.com',
      password: hashed,
      role: 'USER',
      lockedUntil: null,
      isActive: true,
      failedLoginAttempts: 0,
    } as any);
    prisma.user.update.mockResolvedValue({} as any);

    const result = await service.login('login@example.com', 'secret');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('rejects login with wrong password and increments failed attempts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'uid-3',
      email: 'bad@example.com',
      password: await bcrypt.hash('right', 4),
      role: 'USER',
      lockedUntil: null,
      isActive: true,
      failedLoginAttempts: 2,
    } as any);
    prisma.user.update.mockResolvedValue({} as any);

    await expect(service.login('bad@example.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'uid-3' }, data: { failedLoginAttempts: 3, lockedUntil: null } });
  });
});
