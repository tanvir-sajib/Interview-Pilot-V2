import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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
    const saltRounds = this.config.get<number>('BCRYPT_SALT_ROUNDS') || 12;
    const hash = await bcrypt.hash(password, saltRounds);
    const domain = email.split('@')[1];
    const role = domain === 'admin.example.com' ? 'ADMIN' : 'USER';
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        profile: { create: {} },
        isActive: true,
        failedLoginAttempts: 0,
      },
    });
    return this.generateTokens(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
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
    const newAttempts = user.failedLoginAttempts + 1;
    let updateData: any = { failedLoginAttempts: newAttempts };
    if (newAttempts >= 5) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 15);
      updateData.lockedUntil = lockedUntil;
    }
    await this.prisma.user.update({ where: { id: userId }, data: updateData });
  }

  private generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwt.sign(payload, { expiresIn: this.config.get<string>('JWT_EXPIRES_IN') });
    const refreshPayload = { sub: userId, role, tokenType: 'refresh' };
    const refreshToken = this.jwt.sign(refreshPayload, { expiresIn: this.config.get<string>('REFRESH_EXPIRES_IN') });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { ignoreExpiration: false }) as any;
      if (payload.tokenType !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
      return this.generateTokens(payload.sub, payload.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // No revocation in stateless approach; will be handled by issuance of new tokens
    return { success: true };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new UnauthorizedException('Old password incorrect');
    const hashed = await bcrypt.hash(newPassword, this.config.get<number>('BCRYPT_SALT_ROUNDS') || 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { success: true };
  }
}
