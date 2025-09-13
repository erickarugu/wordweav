import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    // Always return the actual count
    const displayCount = userCount.toString();

    return NextResponse.json({
      count: displayCount,
      actualCount: userCount,
    });
  } catch (error) {
    console.error("Error fetching user count:", error);
    return NextResponse.json(
      {
        count: "0",
        actualCount: 0,
      },
      { status: 500 }
    );
  }
}
