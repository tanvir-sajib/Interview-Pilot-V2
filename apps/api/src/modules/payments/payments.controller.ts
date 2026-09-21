import { Controller } from "@nestjs/common";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: any) {}
}
