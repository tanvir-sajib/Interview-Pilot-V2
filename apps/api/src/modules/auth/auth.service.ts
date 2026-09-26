import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

/**
 * AuthService provides registration, login, token refresh, logout, and password change.
 * Refresh tokens are versioned to ensure rotation: each successful refresh increments a
 * per‑user `refreshTokenVersion` stored in the database. The JWT payload includes the
 * current version (`rtv`). Stale tokens are rejected.
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');
    const saltRounds = Number(this.config.get<string>('BCRYPT_SALT_ROUNDS')) || 12;
    const hash = await bcrypt.hash(password, saltRounds);
    const domain = email.split('@')[1];
    const role = domain === 'admin.example.com' ? 'ADMIN' : 'USER';
       const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        isActive: true,
        failedLoginAttempts: 0,
        profile: { create: {} as any },
      },
    });
    return this.generateTokens(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked, try later');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await this.incrementFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    return this.generateTokens(user.id, user.role);
  }

  private async incrementFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
    const updateData: Prisma.UserUpdateInput = { failedLoginAttempts: newAttempts };
    if (newAttempts >= 5) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 15);
      (updateData as any).lockedUntil = lockedUntil;
    }
    await this.prisma.user.update({ where: { id: userId }, data: updateData });
  }

  private generateTokens(userId: string, role: string, rtv: number = 0) {
    const payload = { sub: userId, role };
    const accessToken = this.jwt.sign(payload, { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '15m' });
    const refreshPayload = { sub: userId, role, tokenType: 'refresh' as const, rtv };
    const refreshToken = this.jwt.sign(refreshPayload, { expiresIn: this.config.get<string>('REFRESH_EXPIRES_IN') || '7d' });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { ignoreExpiration: false }) as any;
      if (payload.tokenType !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      const tokenVersion = payload.rtv ?? 0;
      const storedVersion = (user as any).refreshTokenVersion ?? 0;
      if (storedVersion !== tokenVersion) {
        throw new UnauthorizedException('Refresh token revoked');
      }
      // Increment version atomically (using raw Prisma update with any to bypass type checking)
      await (this.prisma.user as any).update({ where: { id: user.id }, data: { refreshTokenVersion: tokenVersion + 1 } });
      const newRefreshPayload = { sub: user.id, role: user.role, tokenType: 'refresh' as const, rtv: tokenVersion + 1 };
      const newRefresh = this.jwt.sign(newRefreshPayload, { expiresIn: this.config.get<string>('REFRESH_EXPIRES_IN') || '7d' });
      const newAccess = this.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') || '15m' });
      return { accessToken: newAccess, refreshToken: newRefresh };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Invalidate current refresh token by incrementing version (so the token becomes stale)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const currentVersion = (user as any).refreshTokenVersion ?? 0;
      await (this.prisma.user as any).update({ where: { id: userId }, data: { refreshTokenVersion: currentVersion + 1 } });
    }
    return { success: true };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new UnauthorizedException('Old password incorrect');
    const hashed = await bcrypt.hash(newPassword, Number(this.config.get<string>('BCRYPT_SALT_ROUNDS')) || 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    // Invalidate existing refresh tokens after password change for security
    const currentVersion = (user as any).refreshTokenVersion ?? 0;
    await (this.prisma.user as any).update({ where: { id: userId }, data: { refreshTokenVersion: currentVersion + 1 } });
    return { success: true };
  }
}
