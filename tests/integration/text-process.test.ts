/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/text/process/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getAIService } from "@/lib/ai";
import {
  createMockUser,
  createMockDocument,
  createMockAiResponse,
} from "../utils/testHelpers";

// Mock dependencies
jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    usageStats: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    document: {
      create: jest.fn(),
    },
    documentAnalytics: {
      create: jest.fn(),
    },
  },
}));
jest.mock("@/lib/ai");

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockGetAIService = getAIService as jest.MockedFunction<
  typeof getAIService
>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/api/text/process", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    test("successfully processes text with AI", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };
      const mockDocument = createMockDocument();
      const mockAiResponse = createMockAiResponse();

      // Setup mocks
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.usageStats.findUnique.mockResolvedValue(null); // No previous usage
      mockPrisma.document.create.mockResolvedValue(mockDocument);
      mockPrisma.documentAnalytics.create.mockResolvedValue({} as any);
      mockPrisma.usageStats.upsert.mockResolvedValue({} as any);

      const mockAiService = {
        processText: jest.fn().mockResolvedValue(mockAiResponse),
      };
      mockGetAIService.mockReturnValue(mockAiService);

      const requestBody = {
        text: "This is test text that needs processing.",
        title: "Test Document",
        mechanisms: ["grammar", "clarity"],
      };

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.document.id).toBe(mockDocument.id);
      expect(data.analytics).toEqual(mockAiResponse.analytics);

      // Verify AI service was called correctly
      expect(mockAiService.processText).toHaveBeenCalledWith({
        text: requestBody.text,
        mechanisms: requestBody.mechanisms,
        options: {
          temperature: 0.7,
          maxTokens: 8192,
        },
      });

      // Verify document was saved
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          title: requestBody.title,
          originalText: requestBody.text,
          processedText: mockAiResponse.processedText,
          wordCount: expect.any(Number),
          processingTime: expect.any(Number),
          mechanisms: JSON.stringify(requestBody.mechanisms),
        },
      });
    });

    test("rejects unauthenticated requests", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify({
          text: "Test text",
          mechanisms: ["grammar"],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    test("rejects empty text", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify({
          text: "",
          mechanisms: ["grammar"],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Text is required");
    });

    test("enforces word limit", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };

      // Mock existing usage close to limit
      const existingUsage = {
        wordsProcessed: 14000, // Close to 15000 limit
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.usageStats.findUnique.mockResolvedValue(existingUsage as any);

      // Request with text that would exceed limit
      const longText = "word ".repeat(2000); // 2000 words
      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify({
          text: longText,
          mechanisms: ["grammar"],
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Word limit exceeded");
      expect(data.wordsRemaining).toBe(1000);
      expect(data.wordLimit).toBe(15000);
    });

    test("falls back to basic processing if AI fails", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };
      const mockDocument = createMockDocument();

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.usageStats.findUnique.mockResolvedValue(null);
      mockPrisma.document.create.mockResolvedValue(mockDocument);
      mockPrisma.documentAnalytics.create.mockResolvedValue({} as any);
      mockPrisma.usageStats.upsert.mockResolvedValue({} as any);

      const mockAiService = {
        processText: jest
          .fn()
          .mockRejectedValue(new Error("AI service unavailable")),
      };
      mockGetAIService.mockReturnValue(mockAiService);

      const requestBody = {
        text: "This is test text that needs processing.",
        mechanisms: ["grammar", "clarity"],
      };

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.provider).toBe("Fallback");
      expect(data.metadata.model).toBe("rule-based");
    });

    test("updates usage statistics correctly", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };
      const mockDocument = createMockDocument();
      const mockAiResponse = createMockAiResponse();

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.usageStats.findUnique.mockResolvedValue(null);
      mockPrisma.document.create.mockResolvedValue(mockDocument);
      mockPrisma.documentAnalytics.create.mockResolvedValue({} as any);
      mockPrisma.usageStats.upsert.mockResolvedValue({} as any);

      const mockAiService = {
        processText: jest.fn().mockResolvedValue(mockAiResponse),
      };
      mockGetAIService.mockReturnValue(mockAiService);

      const requestBody = {
        text: "This is test text with ten words exactly here.",
        mechanisms: ["grammar"],
      };

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      await POST(request);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      expect(mockPrisma.usageStats.upsert).toHaveBeenCalledWith({
        where: {
          userId_month_year: {
            userId: mockUser.id,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          wordsProcessed: { increment: expect.any(Number) },
          documentsCount: { increment: 1 },
          timeSaved: { increment: mockAiResponse.analytics.timeSaved },
        },
        create: {
          userId: mockUser.id,
          month: currentMonth,
          year: currentYear,
          wordsProcessed: expect.any(Number),
          documentsCount: 1,
          timeSaved: mockAiResponse.analytics.timeSaved,
        },
      });
    });

    test("generates title when none provided", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      };
      const mockAiResponse = createMockAiResponse();

      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.usageStats.findUnique.mockResolvedValue(null);
      mockPrisma.document.create.mockResolvedValue({} as any);
      mockPrisma.documentAnalytics.create.mockResolvedValue({} as any);
      mockPrisma.usageStats.upsert.mockResolvedValue({} as any);

      const mockAiService = {
        processText: jest.fn().mockResolvedValue(mockAiResponse),
      };
      mockGetAIService.mockReturnValue(mockAiService);

      const requestBody = {
        text: "Test text without title",
        mechanisms: ["grammar"],
        // No title provided
      };

      const request = new NextRequest("http://localhost/api/text/process", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      await POST(request);

      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: expect.stringMatching(/^Document \d{4}-\d{2}-\d{2}T/), // Auto-generated title
        }),
      });
    });
  });
});
