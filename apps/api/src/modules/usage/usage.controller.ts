import { Controller, Post, Body } from "@nestjs/common";
import { UsageService } from "./usage.service";
import { Metric } from "@prisma/client";

/** Simple endpoint for recording usage from client applications. */
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post('record')
  async record(@Body() body: { userId: string; metric: Metric; amount: number }) {
    const { userId, metric, amount } = body;
    return this.usageService.recordUsage(userId, metric, amount);
  }
}
