// Test script for AI service
import { getAIService } from "../lib/ai";

async function testAIService() {
  console.log("🚀 Testing AI Service...");

  try {
    const aiService = getAIService();
    console.log(
      `✅ AI Service initialized with provider: ${aiService.getProviderName()}`
    );

    const testText = `Furthermore, it is important to note that the implementation of this technology will significantly enhance user experience. Moreover, the utilization of advanced algorithms ensures optimal performance. Additionally, the system demonstrates excellent scalability.`;

    const mechanisms = ["naturalize", "clarity"];

    console.log("\n📝 Input text:", testText);
    console.log("\n🔧 Selected mechanisms:", mechanisms);

    const result = await aiService.processText({
      text: testText,
      mechanisms,
      options: {
        temperature: 0.7,
      },
    });

    console.log("\n✨ Processed text:", result.processedText);
    console.log("\n📊 Analytics:", result.analytics);
    console.log("\n🔧 Metadata:", result.metadata);

    console.log("\n🎉 AI Service test completed successfully!");
  } catch (error) {
    console.error("❌ AI Service test failed:", error);
  }
}

// Only run if this file is executed directly
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  testAIService();
}

export default testAIService;
