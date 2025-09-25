import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

export async function GET() {
  try {
    console.log("🔍 Database provider:", config.database.provider);
    console.log(
      "🔍 Database URL includes supabase:",
      config.database.url.includes("supabase")
    );

    // Test database connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");

    // Try to count users
    const userCount = await prisma.user.count();
    console.log("✅ User count query successful:", userCount);

    // Always return the actual count
    const displayCount = userCount.toString();

    return NextResponse.json({
      count: displayCount,
      actualCount: userCount,
      provider: config.database.provider,
      environment: config.environment,
    });
  } catch (error) {
    console.error("❌ Error fetching user count:", error);

    // Return a fallback response with error details
    return NextResponse.json(
      {
        count: "0",
        actualCount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: config.database.provider,
        environment: config.environment,
      },
      { status: 500 }
    );
  }
}
