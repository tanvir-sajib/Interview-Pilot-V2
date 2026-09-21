import { Controller } from "@nestjs/common";

@Controller("answers")
export class AnswersController {
  constructor(private readonly answersService: any) {}
}
