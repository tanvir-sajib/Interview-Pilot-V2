import { ILLMProvider, EvaluationResult } from './llm-provider.interface';

/**
 * MockLLMProvider implements the {@link ILLMProvider} interface but returns static,
 * deterministic data suitable for unit tests and local development. It can also be
 * configured to simulate failures.
 */
export class MockLLMProvider implements ILLMProvider {
  private failMode: 'none' | 'timeout' | 'malformed' | 'rate-limit' = 'none';

  constructor(failMode?: 'none' | 'timeout' | 'malformed' | 'rate-limit') {
    if (failMode) this.failMode = failMode;
  }

  async evaluateAnswer(answer: string, context?: any): Promise<EvaluationResult> {
    // Simulate delay (e.g., network latency).
    await new Promise(resolve => setTimeout(resolve, 50));

    if (this.failMode === 'timeout') {
      // Simulate a timeout by never resolving – but we must not hang the test.
      // Throw a specific error which the worker can catch and treat as timeout.
      throw new Error('LLM_PROVIDER_TIMEOUT');
    }
    if (this.failMode === 'malformed') {
      // Return data that fails validation.
      return { unexpected: true } as any;
    }
    if (this.failMode === 'rate-limit') {
      const err: any = new Error('Rate limit exceeded');
      err.code = 'RATE_LIMIT';
      throw err;
    }

    const result: EvaluationResult = {
      overallScore: 85,
      correctness: 90,
      completeness: 80,
      technicalDepth: 75,
      structure: 80,
      communication: 88,
      strengths: ['Clear explanation', 'Good examples'],
      weaknesses: ['Missing edge cases'],
      missingConcepts: ['Complexity analysis'],
      improvementTips: ['Consider performance implications'],
      confidence: 0.92,
      provider: 'mock',
      model: 'mock-model',
      modelVersion: '1.0',
      promptVersion: 'v1',
      rubricVersion: 'v1',
      evaluationVersion: 'v1',
    };
    return result;
  }

  async generateFeedback(result: EvaluationResult): Promise<string> {
    return `Overall score ${result.overallScore}. Strengths: ${result.strengths.join(', ')}.`;
  }

  async generateQuestion(result: EvaluationResult): Promise<string> {
    return 'Can you elaborate on your approach to handling edge cases?';
  }

  async summarizeSession(sessionId: string): Promise<string> {
    return `Session ${sessionId} summary placeholder.`;
  }
}
