import { Controller } from "@nestjs/common";

@Controller("ai")
export class AIController {
  constructor(private readonly aiService: any) {}
}
