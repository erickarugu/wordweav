import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { securityMiddleware } from "@/lib/security";
import { validateRequest, newsletterSubscribeSchema } from "@/lib/validation";

async function subscribeHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request data
    const validation = await validateRequest(
      request,
      newsletterSubscribeSchema
    );
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, source } = validation.data;

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "This email is already subscribed to our newsletter" },
        { status: 409 }
      );
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        source,
        subscribedAt: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Apply security middleware for public endpoint with rate limiting
export const POST = securityMiddleware.public(subscribeHandler);
