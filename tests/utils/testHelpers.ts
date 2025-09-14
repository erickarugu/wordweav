import { User, Document, Payment, NewsletterSubscriber } from "@prisma/client";

// Test data factories
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-test-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: null,
  image: null,
  password: "hashedPassword123",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  subscriptionId: null,
  subscriptionStatus: null,
  planType: null,
  subscriptionStartDate: null,
  subscriptionEndDate: null,
  trialStartDate: null,
  trialEndDate: null,
  isOnTrial: false,
  customerId: null,
  ...overrides,
});

export const createMockDocument = (
  overrides: Partial<Document> = {}
): Document => ({
  id: "doc-test-id",
  userId: "user-test-id",
  title: "Test Document",
  originalText: "This is original test text that needs processing.",
  processedText: "This is processed test text that has been improved.",
  wordCount: 9,
  processingTime: 1500,
  mechanisms: JSON.stringify(["grammar", "clarity"]),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockPayment = (
  overrides: Partial<Payment> = {}
): Payment => ({
  id: "payment-test-id",
  userId: "user-test-id",
  paymentId: "pay_123456",
  subscriptionId: "sub_123456",
  amount: 999,
  currency: "usd",
  status: "succeeded",
  description: "Monthly subscription",
  invoiceUrl: "https://invoice.example.com",
  paymentDate: new Date("2024-01-01"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockNewsletterSubscriber = (
  overrides: Partial<NewsletterSubscriber> = {}
): NewsletterSubscriber => ({
  id: "subscriber-test-id",
  email: "newsletter@example.com",
  subscribedAt: new Date("2024-01-01"),
  isActive: true,
  unsubscribedAt: null,
  source: "homepage",
  ...overrides,
});

// Mock API response helpers
export const mockApiResponse = <T>(data: T, status = 200) => ({
  json: jest.fn().mockResolvedValue(data),
  status,
  ok: status >= 200 && status < 300,
});

export const mockNextRequest = (body: any = {}, method = "POST") => ({
  json: jest.fn().mockResolvedValue(body),
  method,
  url: "http://localhost:3000/api/test",
  headers: new Headers(),
});

export const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options) => ({
    ...data,
    status: options?.status || 200,
  })),
};

// Session helpers
export const createMockSession = (user: Partial<User> = {}) => ({
  user: {
    id: user.id || "user-test-id",
    email: user.email || "test@example.com",
    name: user.name || "Test User",
    image: user.image || null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

// AI Service mock responses
export const createMockAiResponse = () => ({
  processedText:
    "This is the AI-processed text with improved clarity and grammar.",
  analytics: {
    readabilityScore: 85.5,
    sentimentScore: 0.8,
    complexityScore: 65.2,
    improvementScore: 92.1,
    keywordDensity: { test: 0.1, example: 0.05 },
    grammarIssues: 2,
    styleImprovements: 5,
    wordsProcessed: 10,
    timeSaved: 5,
  },
  metadata: {
    provider: "Google Gemini",
    model: "gemini-1.5-flash",
    tokensUsed: 150,
  },
});

// Database operation helpers
export const mockPrismaOperations = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  document: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usageStats: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  newsletterSubscriber: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  passwordResetToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  documentAnalytics: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Reset all mocks
export const resetMocks = () => {
  Object.values(mockPrismaOperations).forEach((model) => {
    Object.values(model).forEach((method) => {
      method.mockReset();
    });
  });
};
