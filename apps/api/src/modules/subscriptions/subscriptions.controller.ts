import { Controller } from "@nestjs/common";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: any) {}
}
