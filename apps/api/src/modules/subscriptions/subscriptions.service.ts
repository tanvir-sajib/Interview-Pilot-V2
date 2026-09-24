import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionStatus } from "@prisma/client";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  /**
   * Create a new subscription for a user.
   * The subscription starts in PENDING status until a payment is verified.
   * Records an audit entry for the creation.
   */
  async createSubscription(userId: string) {
    const sub = await this.prisma.subscription.create({
      data: {
        userId,
        usageLimit: 0,
        featureAccess: {},
        // set a pending status for business flow; DB default may differ
        status: SubscriptionStatus.PENDING,
      } as any,
    });
    await this.audit.record(null, "CREATE_SUBSCRIPTION", { userId, subscriptionId: sub.id });
    return sub;
  }

  /** Activate a subscription after payment verification. */
  async activateSubscription(subscriptionId: string) {
    const sub = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE, startDate: new Date() } as any,
    });
    await this.audit.record(null, "ACTIVATE_SUBSCRIPTION", { subscriptionId });
    return sub;
  }

  /** Cancel a subscription. */
  async cancelSubscription(subscriptionId: string) {
    const sub = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELLED, endDate: new Date() } as any,
    });
    await this.audit.record(null, "CANCEL_SUBSCRIPTION", { subscriptionId });
    return sub;
  }

  /** Retrieve subscription with its payments and usage records. */
  async getSubscriptionDetails(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { payments: true, user: true },
    });
  }
}
