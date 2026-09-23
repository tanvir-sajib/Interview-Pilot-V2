import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Metric } from "@prisma/client";

/**
 * Service responsible for recording and querying usage metrics.
 * It stores per‑user usage records which can be later consulted for limits.
 */
@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async recordUsage(userId: string, metric: Metric, amount: number) {
    return this.prisma.usageRecord.create({
      data: {
        userId,
        metric,
        amount,
        period: new Date(),
      },
    });
  }

  async getUsageForPeriod(userId: string, metric: Metric, from: Date, to: Date) {
    return this.prisma.usageRecord.findMany({
      where: {
        userId,
        metric,
        period: {
          gte: from,
          lte: to,
        },
      },
    });
  }
}
