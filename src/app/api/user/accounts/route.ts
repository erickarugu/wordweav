import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with their connected accounts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the accounts data
    const connectedAccounts = user.accounts.map((account) => ({
      provider: account.provider,
      type: account.type,
      connected: true,
    }));

    // Check if specific providers are connected
    const providers = {
      google: connectedAccounts.some((acc) => acc.provider === "google"),
      credentials:
        connectedAccounts.some((acc) => acc.provider === "credentials") ||
        !!user.password,
    };

    return NextResponse.json({
      connectedAccounts,
      providers,
      hasPassword: !!user.password,
    });
  } catch (error) {
    console.error("Error fetching connected accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
