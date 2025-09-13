// AI Service Types
export interface AIProvider {
  name: string;
  processText(request: TextProcessingRequest): Promise<TextProcessingResponse>;
}

export interface TextProcessingRequest {
  text: string;
  mechanisms: string[];
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface TextProcessingResponse {
  processedText: string;
  analytics: TextAnalytics;
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    processingTimeMs: number;
  };
}

export interface TextAnalytics {
  readabilityScore: number;
  sentimentScore: number;
  complexityScore: number;
  improvementScore: number;
  keywordDensity: Record<string, number>;
  grammarIssues: number;
  styleImprovements: number;
  wordsProcessed: number;
  timeSaved: number; // in minutes
}

export interface PromptTemplate {
  system: string;
  user: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}

export type ProcessingMechanism =
  | "naturalize"
  | "clarity"
  | "tone"
  | "structure"
  | "advanced";

export interface MechanismConfig {
  name: string;
  description: string;
  prompt: PromptTemplate;
  temperature: number;
  priority: number;
}
