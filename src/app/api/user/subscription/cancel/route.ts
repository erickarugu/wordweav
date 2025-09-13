import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

    // In a real app, you would cancel the subscription with your payment provider (Stripe, etc.)
    // For now, we'll just return a success response

    // Example Stripe cancellation:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // await stripe.subscriptions.update(subscriptionId, {
    //   cancel_at_period_end: true,
    // });

    return NextResponse.json({
      message: "Subscription canceled successfully",
      canceledAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
