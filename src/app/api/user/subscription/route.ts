import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { securityMiddleware } from "@/lib/security";

// Get subscription handler
async function getSubscriptionHandler(): Promise<NextResponse> {
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

    // Get subscription data from user record
    const subscription = {
      id: user.subscriptionId,
      plan: user.planType || "individual",
      status: user.subscriptionStatus || "inactive",
      currentPeriodStart: user.subscriptionStartDate?.toISOString(),
      currentPeriodEnd: user.subscriptionEndDate?.toISOString(),
      cancelAtPeriodEnd: user.subscriptionStatus === "cancelled",
      isOnTrial: user.isOnTrial,
      trialStartDate: user.trialStartDate?.toISOString(),
      trialEndDate: user.trialEndDate?.toISOString(),
      customerId: user.customerId,
    };

    // Get usage stats from current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const usageStats = await prisma.usageStats.findFirst({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
      },
    });

    // Also get direct word count from documents this month for accuracy
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const documentsThisMonth = await prisma.document.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        wordCount: true,
        createdAt: true,
      },
    });

    // Calculate accurate word count and get most recent usage date
    const actualWordsUsed = documentsThisMonth.reduce(
      (total, doc) => total + doc.wordCount,
      0
    );
    const mostRecentDocument =
      documentsThisMonth.length > 0
        ? documentsThisMonth.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0]
        : null;

    const usage = {
      wordsUsedThisMonth: actualWordsUsed,
      wordsLimit: 15000, // Standard limit for individual plan
      documentsProcessed: documentsThisMonth.length,
      lastUsed:
        mostRecentDocument?.createdAt?.toISOString() ||
        usageStats?.updatedAt?.toISOString(),
      timeSaved: usageStats?.timeSaved || 0,
    };

    return NextResponse.json({
      subscription,
      usage,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}

// Apply security middleware with API rate limiting (100 requests per minute)
export const GET = securityMiddleware.api(getSubscriptionHandler);
