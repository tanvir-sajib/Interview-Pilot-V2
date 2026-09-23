import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, AuditLog } from "@prisma/client";

/**
 * Service that records audit entries for admin actions.
 * Sensitive data (e.g., passwords, payment tokens) must not be stored in the details field.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(actorId: string | null, action: string, details: any) {
    // Enforce that details does not contain suspicious keys – this is a runtime check.
    const forbiddenKeys = ["password", "secret", "token"];
    const jsonString = JSON.stringify(details);
    for (const key of forbiddenKeys) {
      if (jsonString.toLowerCase().includes(key)) {
        throw new Error(`Audit details must not contain sensitive key: ${key}`);
      }
    }
    return this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action,
        details,
      },
    });
  }

  async findMany(skip = 0, take = 100) {
    return this.prisma.auditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }
}
