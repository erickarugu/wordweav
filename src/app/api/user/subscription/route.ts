import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    // Mock subscription data - in a real app, this would come from Stripe or another payment provider
    const subscription = {
      id: "sub_mock_123",
      plan: "individual" as const,
      status: "active" as const,
      currentPeriodStart: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(), // 15 days ago
      currentPeriodEnd: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ).toISOString(), // 15 days from now
      cancelAtPeriodEnd: false,
      priceId: "price_individual_monthly",
      quantity: 1,
    };

    // Mock usage stats - in a real app, this would come from your usage tracking system
    const usage = {
      wordsUsedThisMonth: Math.floor(Math.random() * 12000) + 1000, // Random between 1000-13000
      wordsLimit: 15000,
      documentsProcessed: Math.floor(Math.random() * 50) + 5, // Random between 5-55
      lastUsed: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // Random within last 7 days
    };

    return NextResponse.json({
      subscription,
      usage,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
