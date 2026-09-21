import { Controller } from "@nestjs/common";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: any) {}
}
