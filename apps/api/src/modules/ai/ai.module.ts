import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AIController } from "./ai.controller";
import { AIService } from "./ai.service";
import { LLMProviderService } from "./llm-provider.service";

@Module({
  imports: [ConfigModule],
  controllers: [AIController],
  providers: [AIService, LLMProviderService],
})
export class AIModule {}
