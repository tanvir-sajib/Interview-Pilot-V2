import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILLMProvider, EvaluationResult } from './llm-provider.interface';
import { MockLLMProvider } from './mock-llm.provider';

/**
 * LLMProviderService resolves the concrete {@link ILLMProvider} implementation based on
 * environment configuration. Currently only the mock provider is shipped, but the
 * abstraction allows adding real OpenAI/Anthropic adapters later.
 */
@Injectable()
export class LLMProviderService implements ILLMProvider {
  private readonly provider: ILLMProvider;
  private readonly logger = new Logger(LLMProviderService.name);

  constructor(private readonly config: ConfigService) {
    const providerName = this.config.get<string>('LLM_PROVIDER')?.toLowerCase() ?? 'mock';
    // In a real implementation we would switch on providerName and instantiate the
    // appropriate adapter. For now we fall back to the mock.
    if (providerName === 'mock') {
      // Allow optional fail mode via env for testing (e.g., LLM_MOCK_FAIL=timeout).
      const failMode = this.config.get<string>('LLM_MOCK_FAIL') as any;
      this.provider = new MockLLMProvider(failMode);
    } else {
      this.logger.warn(`LLM provider "${providerName}" not implemented – using mock provider`);
      this.provider = new MockLLMProvider();
    }
  }

  // Delegate all ILLMProvider methods to the concrete implementation.
  async evaluateAnswer(answer: string, context?: any): Promise<EvaluationResult> {
    return this.provider.evaluateAnswer(answer, context);
  }

  async generateFeedback(result: EvaluationResult): Promise<string> {
    if (this.provider.generateFeedback) {
      return this.provider.generateFeedback(result);
    }
    return '';
  }

  async generateQuestion(result: EvaluationResult): Promise<string> {
    if (this.provider.generateQuestion) {
      return this.provider.generateQuestion(result);
    }
    return '';
  }

  async summarizeSession(sessionId: string): Promise<string> {
    if (this.provider.summarizeSession) {
      return this.provider.summarizeSession(sessionId);
    }
    return '';
  }
}
