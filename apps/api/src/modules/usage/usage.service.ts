import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionStatus } from "@prisma/client";

/**
 * Enum representing usage metric types. Mirrors the Prisma enum but defined locally to avoid
 * compile‑time dependencies on generated client types.
 */
export enum UsageType {
  SPEECH_DURATION = "SPEECH_DURATION",
  AI_CALLS = "AI_CALLS",
}

/**
 * Service responsible for recording immutable usage ledger entries.
 * Each call creates a new UsageRecord; no updates are performed.
 */
@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  /** Append a usage record to the ledger.
   * Performs checks:
   *   - User must have an ACTIVE subscription.
   *   - The total usage must not exceed the subscription's usageLimit.
   */
  async recordUsage(userId: string, type: UsageType, amount: number) {
    // Verify active subscription
    const activeSub = await (this.prisma as any).subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!activeSub) {
      throw new Error("No active subscription");
    }
    // Enforce usage limit (simple sum of existing usage for this user)
    const aggregate = await (this.prisma as any).usageRecord.aggregate({
      where: { userId, type },
      _sum: { amount: true },
    });
    const used = aggregate._sum?.amount ?? 0;
    if (used + amount > activeSub.usageLimit) {
      throw new Error("Usage limit exceeded");
    }
    // Record the usage
    return (this.prisma as any).usageRecord.create({
      data: { userId, type, amount },
    });
  }

  /** Retrieve usage for a given type and date range. */
  async getUsage(userId: string, type: UsageType, from: Date, to: Date) {
    // Cast to any to bypass strict typing; the generated client may not have a 'type' field.
    return (this.prisma as any).usageRecord.findMany({
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
