import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UsageType } from "@prisma/client";

/**
 * Service responsible for recording immutable usage ledger entries.
 * Each call creates a new UsageRecord; no updates are performed.
 */
@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  /** Append a usage record to the ledger. */
  async recordUsage(userId: string, type: UsageType, amount: number) {
    return this.prisma.usageRecord.create({
      data: {
        userId,
        type,
        amount,
        // period removed; using createdAt timestamp automatically
      },
    });
  }

  /** Retrieve usage for a given type and date range. */
  async getUsage(userId: string, type: UsageType, from: Date, to: Date) {
    return this.prisma.usageRecord.findMany({
      where: {
        userId,
        type,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }
}
