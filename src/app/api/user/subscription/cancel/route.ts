import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { lemonSqueezySetup } from "@/lib/lemonsqueezy";
import { cancelSubscription } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST() {
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

    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Setup Lemon Squeezy API
    lemonSqueezySetup();

    try {
      // Cancel the subscription with Lemon Squeezy
      const result = await cancelSubscription(user.subscriptionId);

      if (result.error) {
        console.error("Lemon Squeezy cancellation error:", result.error);
        return NextResponse.json(
          { error: "Failed to cancel subscription with payment provider" },
          { status: 500 }
        );
      }

      // Update the user's subscription status in the database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "cancelled",
        },
      });

      return NextResponse.json({
        message:
          "Subscription canceled successfully. You'll retain access until the end of your current billing period.",
        canceledAt: new Date().toISOString(),
      });
    } catch (lemonSqueezyError) {
      console.error(
        "Error canceling Lemon Squeezy subscription:",
        lemonSqueezyError
      );
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
