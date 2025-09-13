import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIProvider,
  TextProcessingRequest,
  TextProcessingResponse,
  TextAnalytics,
  ProcessingMechanism,
} from "./types";
import { MECHANISM_CONFIGS } from "./prompts";

export class GeminiProvider implements AIProvider {
  public readonly name = "Google Gemini";
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 2.5 Flash for optimal cost-performance balance
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  async processText(
    request: TextProcessingRequest
  ): Promise<TextProcessingResponse> {
    const startTime = Date.now();

    try {
      // Process text through each selected mechanism sequentially
      let processedText = request.text;
      let totalTokensUsed = 0;

      // Apply mechanisms in priority order
      const sortedMechanisms = request.mechanisms
        .map((m) => ({ name: m, config: MECHANISM_CONFIGS[m] }))
        .filter((m) => m.config)
        .sort((a, b) => a.config.priority - b.config.priority);

      for (const mechanism of sortedMechanisms) {
        const result = await this.processSingleMechanism(
          processedText,
          mechanism.name as ProcessingMechanism,
          request.options?.temperature || mechanism.config.temperature
        );
        processedText = result.text;
        totalTokensUsed += result.tokensUsed;
      }

      // Generate analytics for the processed text
      const analytics = await this.generateAnalytics(
        request.text,
        processedText
      );

      const processingTime = Date.now() - startTime;

      return {
        processedText,
        analytics,
        metadata: {
          provider: this.name,
          model: "gemini-2.5-flash",
          tokensUsed: totalTokensUsed,
          processingTimeMs: processingTime,
        },
      };
    } catch (error) {
      console.error("Gemini processing error:", error);

      // Check if it's a network error and provide more specific error info
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (this.isNetworkError(error)) {
        console.warn(
          "Network connectivity issue detected, AI service will use fallback"
        );
        throw new Error("NETWORK_ERROR: " + errorMessage);
      }

      if (this.isQuotaError(error)) {
        console.warn("API quota exceeded, AI service will use fallback");
        throw new Error("QUOTA_ERROR: " + errorMessage);
      }

      throw new Error(`Text processing failed: ${errorMessage}`);
    }
  }

  private isNetworkError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("network") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection")
    );
  }

  private isQuotaError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("limit exceeded") ||
      errorMessage.includes("429")
    );
  }

  private async processSingleMechanism(
    text: string,
    mechanism: ProcessingMechanism,
    temperature: number
  ): Promise<{ text: string; tokensUsed: number }> {
    const config = MECHANISM_CONFIGS[mechanism];
    if (!config) {
      throw new Error(`Unknown mechanism: ${mechanism}`);
    }

    // Create model instance with mechanism-specific temperature
    const mechanismModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      systemInstruction: config.prompt.system,
    });

    // Format the user prompt with the current text
    const userPrompt = config.prompt.user.replace("{text}", text);

    // Add examples if available
    let fullPrompt = userPrompt;
    if (config.prompt.examples && config.prompt.examples.length > 0) {
      const exampleText = config.prompt.examples
        .map((ex) => `Example Input: ${ex.input}\nExample Output: ${ex.output}`)
        .join("\n\n");
      fullPrompt = `${exampleText}\n\n${userPrompt}`;
    }

    const result = await mechanismModel.generateContent(fullPrompt);
    const response = result.response;

    if (!response) {
      throw new Error("No response from Gemini API");
    }

    const processedText = response.text();

    // Estimate token usage (approximate)
    const tokensUsed = Math.ceil((text.length + processedText.length) / 4);

    return {
      text: processedText,
      tokensUsed,
    };
  }

  private async generateAnalytics(
    originalText: string,
    processedText: string
  ): Promise<TextAnalytics> {
    const analyticsPrompt = `
You are a text analytics expert. Analyze the following text transformation and provide detailed metrics.

ORIGINAL TEXT:
${originalText}

PROCESSED TEXT:
${processedText}

Provide analytics in this EXACT JSON format. Respond with ONLY valid JSON, no markdown formatting, no explanations, no additional text:

{
  "readabilityScore": [0-100 score based on Flesch Reading Ease],
  "sentimentScore": [0-100 score, 50=neutral, higher=more positive],
  "complexityScore": [0-100 score, higher=more complex],
  "improvementScore": [0-100 percentage improvement from original],
  "grammarIssues": [estimated number of grammar issues fixed],
  "styleImprovements": [estimated number of style improvements made],
  "wordsProcessed": [exact word count of processed text],
  "timeSaved": [estimated minutes saved by using this processing]
}`;

    try {
      const analyticsModel = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent analytics
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const result = await analyticsModel.generateContent(analyticsPrompt);
      const analyticsText = result.response.text();

      // Clean and parse JSON response
      let analyticsData;
      try {
        // Remove any markdown formatting or extra text
        const cleanedText = analyticsText
          .replace(/```json\s*|\s*```/g, "")
          .trim();
        analyticsData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn(
          "JSON parsing failed, attempting to extract JSON from response:",
          parseError
        );
        // Try to extract JSON from the response using regex
        const jsonMatch = analyticsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analyticsData = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            const errorMessage =
              extractError instanceof Error
                ? extractError.message
                : "Unknown error";
            throw new Error(`Failed to parse analytics JSON: ${errorMessage}`);
          }
        } else {
          throw new Error("No valid JSON found in analytics response");
        }
      }

      // Generate keyword density
      const keywordDensity = this.calculateKeywordDensity(processedText);

      return {
        ...analyticsData,
        keywordDensity,
      };
    } catch (error) {
      console.warn("Analytics generation failed, using fallback:", error);
      // Fallback analytics if AI analysis fails
      return this.generateFallbackAnalytics(originalText, processedText);
    }
  }

  private generateFallbackAnalytics(
    originalText: string,
    processedText: string
  ): TextAnalytics {
    const originalWords = originalText.trim().split(/\s+/).length;
    const processedWords = processedText.trim().split(/\s+/).length;

    return {
      readabilityScore: 75, // Assume good readability
      sentimentScore: 60, // Slightly positive
      complexityScore: 45, // Moderate complexity
      improvementScore: 25, // Conservative improvement estimate
      keywordDensity: this.calculateKeywordDensity(processedText),
      grammarIssues: Math.floor(originalWords / 50), // Estimate based on text length
      styleImprovements: Math.floor(originalWords / 30),
      wordsProcessed: processedWords,
      timeSaved: Math.max(1, Math.floor(processedWords / 100)), // Estimate 1 min per 100 words
    };
  }

  private calculateKeywordDensity(text: string): Record<string, number> {
    // Simple keyword density calculation
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3); // Only words longer than 3 characters

    const wordCount = words.length;
    const wordFreq: Record<string, number> = {};

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const keywordDensity: Record<string, number> = {};
    Object.entries(wordFreq)
      .filter(([, count]) => count > 1) // Only words that appear more than once
      .sort(([, a], [, b]) => b - a) // Sort by frequency
      .slice(0, 10) // Top 10 keywords
      .forEach(([word, count]) => {
        keywordDensity[word] = (count / wordCount) * 100;
      });

    return keywordDensity;
  }
}

export default GeminiProvider;
