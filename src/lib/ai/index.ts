// AI Service Exports
export { AIService, getAIService } from "./service";
export { GeminiProvider } from "./gemini-provider";
export { PROMPT_TEMPLATES, MECHANISM_CONFIGS } from "./prompts";
export type {
  AIProvider,
  TextProcessingRequest,
  TextProcessingResponse,
  TextAnalytics,
  PromptTemplate,
  ProcessingMechanism,
  MechanismConfig,
} from "./types";

// Default export for convenience
export { getAIService as default } from "./service";
