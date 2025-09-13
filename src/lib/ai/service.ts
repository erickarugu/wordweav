import {
  AIProvider,
  TextProcessingRequest,
  TextProcessingResponse,
} from "./types";
import GeminiProvider from "./gemini-provider";

/**
 * AI Service Factory - Easily switch between different AI providers
 * Currently supports: Google Gemini
 * Future support: OpenAI, Anthropic, etc.
 */
export class AIService {
  private provider: AIProvider;

  constructor(providerName: "gemini" | "openai" | "anthropic" = "gemini") {
    this.provider = this.createProvider(providerName);
  }

  private createProvider(providerName: string): AIProvider {
    switch (providerName) {
      case "gemini":
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
          throw new Error("GEMINI_API_KEY environment variable is required");
        }
        return new GeminiProvider(geminiApiKey);

      case "openai":
        // TODO: Implement OpenAI provider when needed
        throw new Error("OpenAI provider not yet implemented");

      case "anthropic":
        // TODO: Implement Anthropic provider when needed
        throw new Error("Anthropic provider not yet implemented");

      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  async processText(
    request: TextProcessingRequest
  ): Promise<TextProcessingResponse> {
    // Validate request
    if (!request.text || !request.text.trim()) {
      throw new Error("Text is required for processing");
    }

    if (!request.mechanisms || request.mechanisms.length === 0) {
      throw new Error("At least one processing mechanism must be selected");
    }

    // Validate mechanisms
    const validMechanisms = [
      "naturalize",
      "clarity",
      "tone",
      "structure",
      "advanced",
    ];
    const invalidMechanisms = request.mechanisms.filter(
      (m) => !validMechanisms.includes(m)
    );
    if (invalidMechanisms.length > 0) {
      throw new Error(`Invalid mechanisms: ${invalidMechanisms.join(", ")}`);
    }

    try {
      return await this.provider.processText(request);
    } catch (error) {
      console.error("AI Service processing error:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a known error type that should trigger fallback
      if (this.shouldUseFallback(errorMessage)) {
        console.warn("Using fallback processing due to:", errorMessage);
        return this.createFallbackResponse(request);
      }

      // For other errors, still throw to trigger the route's fallback
      throw new Error(`Text processing failed: ${errorMessage}`);
    }
  }

  private shouldUseFallback(errorMessage: string): boolean {
    return (
      errorMessage.includes("NETWORK_ERROR") ||
      errorMessage.includes("QUOTA_ERROR") ||
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("timeout")
    );
  }

  private createFallbackResponse(
    request: TextProcessingRequest
  ): TextProcessingResponse {
    const wordCount = request.text.trim().split(/\s+/).length;
    const processingTime = 1000; // 1 second fallback

    // Create a basic improved version of the text with simple rules
    let fallbackProcessedText = request.text;

    // Apply basic text improvements
    if (request.mechanisms.includes("clarity")) {
      fallbackProcessedText = fallbackProcessedText
        .replace(/\s+/g, " ") // Multiple spaces to single
        .replace(/([.!?])\s*([A-Z])/g, "$1 $2") // Proper spacing after sentences
        .trim();
    }

    return {
      processedText: fallbackProcessedText,
      analytics: {
        readabilityScore: 70,
        sentimentScore: 60,
        complexityScore: 50,
        improvementScore: 15,
        keywordDensity: {},
        grammarIssues: Math.floor(wordCount / 50),
        styleImprovements: Math.floor(wordCount / 30),
        wordsProcessed: wordCount,
        timeSaved: Math.max(1, Math.floor(wordCount / 100)),
      },
      metadata: {
        provider: "fallback",
        model: "basic-processing",
        tokensUsed: Math.ceil(wordCount * 1.3),
        processingTimeMs: processingTime,
      },
    };
  }

  getProviderName(): string {
    return this.provider.name;
  }

  // Utility method to estimate processing cost/time
  estimateProcessing(
    text: string,
    mechanisms: string[]
  ): {
    estimatedTokens: number;
    estimatedTimeMs: number;
    estimatedCost: number; // in USD
  } {
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedTokens = Math.ceil(wordCount * 1.3 * mechanisms.length); // Rough estimate
    const estimatedTimeMs = 2000 + mechanisms.length * 1500; // Base time + per mechanism
    const estimatedCost = (estimatedTokens / 1000) * 0.0001; // Very rough cost estimate

    return {
      estimatedTokens,
      estimatedTimeMs,
      estimatedCost,
    };
  }
}

// Singleton instance for easy access
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService("gemini");
  }
  return aiServiceInstance;
}

export default AIService;
