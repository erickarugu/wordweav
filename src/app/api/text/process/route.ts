import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getAIService } from "@/lib/ai";
import { securityMiddleware } from "@/lib/security";
import { validateRequest, textProcessingSchema } from "@/lib/validation";
import { getClientId } from "@/lib/rate-limit";

interface TextAnalytics {
  readabilityScore: number;
  sentimentScore: number;
  complexityScore: number;
  improvementScore: number;
  keywordDensity: Record<string, number>;
  grammarIssues: number;
  styleImprovements: number;
  wordsProcessed: number;
  timeSaved: number;
}

async function processTextHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate request data
    const validation = await validateRequest(request, textProcessingSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { text, title, mechanisms } = validation.data;
    const wordCount = text.trim().split(/\s+/).length;

    // Check usage limits (15,000 words per month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const usageStats = await prisma.usageStats.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    const currentWordsUsed = usageStats?.wordsProcessed || 0;
    const wordLimit = 15000;

    if (currentWordsUsed + wordCount > wordLimit) {
      return NextResponse.json(
        {
          error: "Word limit exceeded",
          message: `You have ${
            wordLimit - currentWordsUsed
          } words remaining this month. This request requires ${wordCount} words.`,
          wordsRemaining: Math.max(0, wordLimit - currentWordsUsed),
          wordLimit,
        },
        { status: 429 }
      );
    }

    const startTime = Date.now();

    try {
      // Use AI service for text processing
      const aiService = getAIService();
      const aiResponse = await aiService.processText({
        text,
        mechanisms,
        options: {
          temperature: 0.7,
          maxTokens: 8192,
        },
      });

      const processingTime = Date.now() - startTime;

      // Generate unique title if none provided
      const documentTitle =
        title ||
        `Document ${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, -5)}`;

      // Save to database
      const document = await prisma.document.create({
        data: {
          userId: user.id,
          title: documentTitle,
          originalText: text,
          processedText: aiResponse.processedText,
          wordCount,
          processingTime,
          mechanisms: JSON.stringify(mechanisms),
        },
      });

      // Save analytics with all required fields
      await prisma.documentAnalytics.create({
        data: {
          documentId: document.id,
          readabilityScore: aiResponse.analytics.readabilityScore,
          sentimentScore: aiResponse.analytics.sentimentScore,
          complexityScore: aiResponse.analytics.complexityScore,
          improvementScore: aiResponse.analytics.improvementScore,
          keywordDensity: aiResponse.analytics.keywordDensity,
          grammarIssues: aiResponse.analytics.grammarIssues,
          styleImprovements: aiResponse.analytics.styleImprovements,
          wordsProcessed: aiResponse.analytics.wordsProcessed,
          timeSaved: aiResponse.analytics.timeSaved,
        },
      });

      // Update usage statistics
      const timeSavedMinutes = aiResponse.analytics.timeSaved;

      await prisma.usageStats.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          wordsProcessed: { increment: wordCount },
          documentsCount: { increment: 1 },
          timeSaved: { increment: timeSavedMinutes },
        },
        create: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
          wordsProcessed: wordCount,
          documentsCount: 1,
          timeSaved: timeSavedMinutes,
        },
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          originalText: document.originalText,
          processedText: document.processedText,
          wordCount: document.wordCount,
          processingTime: document.processingTime,
          mechanisms: JSON.parse(document.mechanisms),
          createdAt: document.createdAt,
        },
        analytics: aiResponse.analytics,
        usage: {
          wordsUsed: currentWordsUsed + wordCount,
          wordLimit,
          wordsRemaining: wordLimit - (currentWordsUsed + wordCount),
          timeSaved: timeSavedMinutes,
        },
        metadata: {
          provider: aiResponse.metadata.provider,
          model: aiResponse.metadata.model,
          tokensUsed: aiResponse.metadata.tokensUsed,
        },
      });
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      // Fallback to basic processing if AI fails
      const processedText = await processTextWithMechanisms(text, mechanisms);
      const processingTime = Date.now() - startTime;
      const analytics = await calculateAnalytics(
        text,
        processedText,
        mechanisms
      );

      // Save to database with fallback
      const document = await prisma.document.create({
        data: {
          userId: user.id,
          title: title || `Document ${new Date().toLocaleDateString()}`,
          originalText: text,
          processedText,
          wordCount,
          processingTime,
          mechanisms: JSON.stringify(mechanisms),
        },
      });

      // Save analytics
      await prisma.documentAnalytics.create({
        data: {
          documentId: document.id,
          readabilityScore: analytics.readabilityScore,
          sentimentScore: analytics.sentimentScore,
          complexityScore: analytics.complexityScore,
          improvementScore: analytics.improvementScore,
          keywordDensity: analytics.keywordDensity,
          grammarIssues: analytics.grammarIssues,
          styleImprovements: analytics.styleImprovements,
          wordsProcessed: analytics.wordsProcessed,
          timeSaved: analytics.timeSaved,
        },
      });

      // Update usage statistics
      const timeSavedMinutes = analytics.timeSaved;

      await prisma.usageStats.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          wordsProcessed: { increment: wordCount },
          documentsCount: { increment: 1 },
          timeSaved: { increment: timeSavedMinutes },
        },
        create: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
          wordsProcessed: wordCount,
          documentsCount: 1,
          timeSaved: timeSavedMinutes,
        },
      });

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          originalText: document.originalText,
          processedText: document.processedText,
          wordCount: document.wordCount,
          processingTime: document.processingTime,
          mechanisms: JSON.parse(document.mechanisms),
          createdAt: document.createdAt,
        },
        analytics,
        usage: {
          wordsUsed: currentWordsUsed + wordCount,
          wordLimit,
          wordsRemaining: wordLimit - (currentWordsUsed + wordCount),
          timeSaved: timeSavedMinutes,
        },
        metadata: {
          provider: "Fallback",
          model: "rule-based",
          tokensUsed: 0,
        },
      });
    }
  } catch (error) {
    console.error("Error processing text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Apply security middleware
export const POST = securityMiddleware.textProcessing(processTextHandler);

async function processTextWithMechanisms(
  text: string,
  mechanisms: string[]
): Promise<string> {
  let processed = text;

  // Natural Language Flow
  if (mechanisms.includes("naturalize")) {
    // Replace formal connectors with conversational ones
    processed = processed.replace(
      /\b(therefore|thus|consequently|hence)\b/gi,
      "so"
    );
    processed = processed.replace(
      /\b(furthermore|moreover|additionally)\b/gi,
      "also"
    );
    processed = processed.replace(
      /\b(nevertheless|nonetheless|however)\b/gi,
      "but"
    );
    processed = processed.replace(/\b(subsequently|thereafter)\b/gi, "then");
    processed = processed.replace(/\b(in order to)\b/gi, "to");
    processed = processed.replace(/\b(due to the fact that)\b/gi, "because");
  }

  // Improve Clarity
  if (mechanisms.includes("clarity")) {
    // Replace complex words with simpler alternatives
    processed = processed.replace(/\b(utilize|utilization)\b/gi, "use");
    processed = processed.replace(/\b(facilitate)\b/gi, "help");
    processed = processed.replace(/\b(demonstrate)\b/gi, "show");
    processed = processed.replace(/\b(endeavor)\b/gi, "try");
    processed = processed.replace(/\b(commence)\b/gi, "start");
    processed = processed.replace(/\b(terminate)\b/gi, "end");
    processed = processed.replace(/\b(approximately)\b/gi, "about");
    processed = processed.replace(/\b(sufficient)\b/gi, "enough");
  }

  // Adjust Tone
  if (mechanisms.includes("tone")) {
    // Make tone more engaging and less formal
    processed = processed.replace(
      /\b(It is important to note that)\b/gi,
      "Keep in mind that"
    );
    processed = processed.replace(
      /\b(It should be mentioned that)\b/gi,
      "Note that"
    );
    processed = processed.replace(/\b(One must consider)\b/gi, "Consider");
    processed = processed.replace(/\b(It is evident that)\b/gi, "Clearly,");
    processed = processed.replace(/\b(The aforementioned)\b/gi, "This");
  }

  // Better Structure
  if (mechanisms.includes("structure")) {
    // Improve sentence structure and flow
    const sentences = processed.split(/\.\s+/);
    const improvedSentences = sentences.map((sentence) => {
      // Add transitional phrases for better flow
      if (
        sentence.length > 100 &&
        !sentence.match(
          /^(First|Second|Third|Finally|However|Therefore|Additionally)/
        )
      ) {
        // Add variety in sentence starters
        const starters = [
          "Additionally,",
          "Furthermore,",
          "Moreover,",
          "In fact,",
          "Notably,",
        ];
        const randomStarter =
          starters[Math.floor(Math.random() * starters.length)];
        return `${randomStarter} ${sentence.toLowerCase()}`;
      }
      return sentence;
    });
    processed = improvedSentences.join(". ");
  }

  // Advanced Enhancement
  if (mechanisms.includes("advanced")) {
    // Apply advanced NLP-like improvements
    processed = processed.replace(/\b(very good)\b/gi, "excellent");
    processed = processed.replace(/\b(very bad)\b/gi, "terrible");
    processed = processed.replace(/\b(very big)\b/gi, "enormous");
    processed = processed.replace(/\b(very small)\b/gi, "tiny");
    processed = processed.replace(/\b(a lot of)\b/gi, "many");
    processed = processed.replace(/\b(kind of|sort of)\b/gi, "somewhat");
  }

  return processed.trim();
}

async function calculateAnalytics(
  originalText: string,
  processedText: string,
  mechanisms: string[]
): Promise<TextAnalytics> {
  // Calculate readability score (simplified Flesch-Kincaid)
  const sentences = processedText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const words = processedText.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const readabilityScore = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
    )
  );

  // Calculate sentiment score (simplified)
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "perfect",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "poor",
    "worst",
    "hate",
  ];

  const text = processedText.toLowerCase();
  const positiveCount = positiveWords.reduce(
    (acc, word) => acc + (text.match(new RegExp(word, "g")) || []).length,
    0
  );
  const negativeCount = negativeWords.reduce(
    (acc, word) => acc + (text.match(new RegExp(word, "g")) || []).length,
    0
  );

  const sentimentScore = Math.max(
    -1,
    Math.min(1, ((positiveCount - negativeCount) / words.length) * 100)
  );

  // Calculate complexity score
  const complexWords = words.filter((word) => word.length > 6).length;
  const complexityScore = Math.max(
    0,
    Math.min(100, (complexWords / words.length) * 100)
  );

  // Calculate improvement score
  const originalComplexity = calculateComplexity(originalText);
  const processedComplexity = calculateComplexity(processedText);
  const improvementScore = Math.max(
    0,
    Math.min(100, originalComplexity - processedComplexity + 50)
  );

  // Calculate keyword density
  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    const cleaned = word.toLowerCase().replace(/[^\w]/g, "");
    if (cleaned.length > 3) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });

  const keywordDensity: Record<string, number> = {};
  Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([word, count]) => {
      keywordDensity[word] = (count / words.length) * 100;
    });

  // Calculate grammar and style improvements
  const grammarIssues =
    countGrammarIssues(originalText) - countGrammarIssues(processedText);
  const styleImprovements = mechanisms.length * 2; // Simple heuristic

  return {
    readabilityScore: Math.round(readabilityScore * 100) / 100,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    complexityScore: Math.round(complexityScore * 100) / 100,
    improvementScore: Math.round(improvementScore * 100) / 100,
    keywordDensity,
    grammarIssues: Math.max(0, grammarIssues),
    styleImprovements,
    wordsProcessed: words.length,
    timeSaved: Math.max(1, Math.ceil(words.length / 200)), // Estimated time saved in minutes
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateComplexity(text: string): number {
  const words = text.split(/\s+/);
  const longWords = words.filter((word) => word.length > 6).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = words.length / sentences.length;

  return (longWords / words.length) * 100 + (avgSentenceLength / 20) * 100;
}

function countGrammarIssues(text: string): number {
  let issues = 0;

  // Simple heuristics for common grammar issues
  if (text.match(/\s+,/g)) issues += (text.match(/\s+,/g) || []).length; // Space before comma
  if (text.match(/\w\w/g)) issues += (text.match(/\?\?|!!|\.\./g) || []).length; // Double punctuation
  if (text.match(/\b(there|their|they're)\b/gi)) issues += 1; // Potential there/their/they're issues

  return issues;
}
