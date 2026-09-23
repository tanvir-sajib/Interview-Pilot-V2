import { Module } from "@nestjs/common";
import { EvaluationsController } from "./evaluations.controller";
import { EvaluationsService } from "./evaluations.service";
import { LLMProviderService } from "../ai/llm-provider.service";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationsService, LLMProviderService, ConfigService],
})
export class EvaluationsModule {}
