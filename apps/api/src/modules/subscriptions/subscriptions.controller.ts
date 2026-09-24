import { Controller, Post, Body, Param, Get, UseGuards } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

/** Admin‑only subscription management endpoints */
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async create(@Body() body: { userId: string }) {
    const { userId } = body;
    return this.subscriptionsService.createSubscription(userId);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.subscriptionsService.activateSubscription(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.subscriptionsService.getSubscriptionDetails(id);
  }
}
