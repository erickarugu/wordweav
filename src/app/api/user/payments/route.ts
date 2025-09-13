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

    // Mock payment history - in a real app, this would come from Stripe or another payment provider
    const payments = [
      {
        id: "pi_mock_001",
        amount: 999, // $9.99 in cents
        currency: "usd",
        status: "succeeded" as const,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        description: "WordWeave Individual Plan - Monthly",
        invoiceUrl: "https://example.com/invoice/001",
      },
      {
        id: "pi_mock_002",
        amount: 999,
        currency: "usd",
        status: "succeeded" as const,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        description: "WordWeave Individual Plan - Monthly",
        invoiceUrl: "https://example.com/invoice/002",
      },
      {
        id: "pi_mock_003",
        amount: 999,
        currency: "usd",
        status: "succeeded" as const,
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        description: "WordWeave Individual Plan - Monthly",
        invoiceUrl: "https://example.com/invoice/003",
      },
    ];

    return NextResponse.json({
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
