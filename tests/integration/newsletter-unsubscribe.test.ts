/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/newsletter/unsubscribe/route";
import { prisma } from "@/lib/prisma";
import { createMockNewsletterSubscriber } from "../utils/testHelpers";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    newsletterSubscriber: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/api/newsletter/unsubscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    test("successfully unsubscribes existing active subscriber", async () => {
      const email = "test@example.com";
      const activeSubscriber = createMockNewsletterSubscriber({
        email,
        isActive: true,
      });

      const updatedSubscriber = {
        ...activeSubscriber,
        isActive: false,
        unsubscribedAt: new Date(),
      };

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(
        activeSubscriber
      );
      mockPrisma.newsletterSubscriber.update.mockResolvedValue(
        updatedSubscriber
      );

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Successfully unsubscribed from newsletter");

      expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
      });
      expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
        data: {
          isActive: false,
          unsubscribedAt: expect.any(Date),
        },
      });
    });

    test("rejects missing email", async () => {
      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Email is required");
      expect(mockPrisma.newsletterSubscriber.findUnique).not.toHaveBeenCalled();
    });

    test("handles email not found", async () => {
      const email = "nonexistent@example.com";

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Email not found in our subscriber list");
      expect(mockPrisma.newsletterSubscriber.update).not.toHaveBeenCalled();
    });

    test("handles already unsubscribed email", async () => {
      const email = "already@unsubscribed.com";
      const inactiveSubscriber = createMockNewsletterSubscriber({
        email,
        isActive: false,
        unsubscribedAt: new Date("2024-01-01"),
      });

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(
        inactiveSubscriber
      );

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Email is already unsubscribed");
      expect(mockPrisma.newsletterSubscriber.update).not.toHaveBeenCalled();
    });

    test("handles database errors gracefully", async () => {
      const email = "test@example.com";

      mockPrisma.newsletterSubscriber.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error. Please try again later.");
    });

    test("converts email to lowercase", async () => {
      const email = "Test@EXAMPLE.COM";
      const activeSubscriber = createMockNewsletterSubscriber({
        email: email.toLowerCase(),
        isActive: true,
      });

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(
        activeSubscriber
      );
      mockPrisma.newsletterSubscriber.update.mockResolvedValue({
        ...activeSubscriber,
        isActive: false,
        unsubscribedAt: new Date(),
      });

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      await POST(request);

      expect(mockPrisma.newsletterSubscriber.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        data: {
          isActive: false,
          unsubscribedAt: expect.any(Date),
        },
      });
    });

    test("handles update database errors", async () => {
      const email = "test@example.com";
      const activeSubscriber = createMockNewsletterSubscriber({
        email,
        isActive: true,
      });

      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(
        activeSubscriber
      );
      mockPrisma.newsletterSubscriber.update.mockRejectedValue(
        new Error("Update failed")
      );

      const request = new NextRequest(
        "http://localhost/api/newsletter/unsubscribe",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error. Please try again later.");
    });
  });
});
