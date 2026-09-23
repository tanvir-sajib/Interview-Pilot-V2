// Interface for LLM provider abstractions used throughout the evaluation pipeline.
// The methods return plain JavaScript objects that can be validated against a schema.

export interface EvaluationResult {
  // Core structured evaluation fields (see Prompt5.md).
  overallScore: number; // 0-100
  correctness: number;
  completeness: number;
  technicalDepth: number;
  structure: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  improvementTips: string[];
  confidence: number; // 0-1

  // Metadata for reproducibility.
  provider: string;
  model: string;
  modelVersion?: string;
  promptVersion?: string;
  rubricVersion?: string;
  evaluationVersion?: string;
}

export interface ILLMProvider {
  /**
   * Evaluate a user's answer and return a structured {@link EvaluationResult}.
   */
  evaluateAnswer(answer: string, context?: any): Promise<EvaluationResult>;

  /** Optional helper to generate feedback text from the raw evaluation. */
  generateFeedback?(result: EvaluationResult): Promise<string>;

  /** Optional helper to generate a follow‑up question based on the evaluation. */
  generateQuestion?(result: EvaluationResult): Promise<string>;

  /** Optional helper to summarize an entire interview session. */
  summarizeSession?(sessionId: string): Promise<string>;
}
