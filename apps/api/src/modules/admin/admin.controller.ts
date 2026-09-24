import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('secret')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findSecret() {
    return { secret: 'Only admin can see this' };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getDashboard() {
    const [users, subscriptions, payments, usageRecords, auditLogs] = await Promise.all([
      this.prisma.user.findMany(),
      this.prisma.subscription.findMany(),
      this.prisma.payment.findMany(),
      this.prisma.usageRecord.findMany(),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);
    // Simple health check – always ok for now
    const health = { status: 'ok' };
    return { users, subscriptions, payments, usageRecords, auditLogs, health };
  }
}
