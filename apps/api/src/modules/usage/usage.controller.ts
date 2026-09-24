import { Controller, Post, Body } from "@nestjs/common";
import { UsageService } from "./usage.service";
import { UsageType } from "@prisma/client";

/** Simple endpoint for recording usage from client applications. */
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post('record')
  async record(@Body() body: { userId: string; type: UsageType; amount: number }) {
    const { userId, type, amount } = body;
    return this.usageService.recordUsage(userId, type, amount);
  }
}
