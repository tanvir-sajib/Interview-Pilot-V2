import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionStatus } from "@prisma/client";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new subscription for a user and a plan.
   * The subscription starts in PENDING status until a payment is verified.
   */
  async createSubscription(userId: string, planId: string) {
    return this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.PENDING,
      },
    });
  }

  /** Activate a subscription after payment verification. */
  async activateSubscription(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE, startedAt: new Date() },
    });
  }

  /** Cancel a subscription. */
  async cancelSubscription(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELLED, endedAt: new Date() },
    });
  }

  /** Retrieve subscription with its payments and usage records. */
  async getSubscriptionDetails(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { payments: true, plan: true, user: true },
    });
  }
}
