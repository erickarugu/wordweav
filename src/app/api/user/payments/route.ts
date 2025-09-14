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

    // Fetch real payment history from database
    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    // Format payments for display
    const formattedPayments = payments.map((payment) => ({
      id: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      date: payment.paymentDate.toISOString(),
      description: payment.description || "Subscription payment",
      invoiceUrl: payment.invoiceUrl,
    }));

    return NextResponse.json({
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
