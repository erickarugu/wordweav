import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get documents with analytics
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      include: {
        analytics: true,
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalDocuments = await prisma.document.count({
      where: { userId: user.id },
    });

    // Get current month usage stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentUsage = await prisma.usageStats.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    // Get last 6 months usage for trends
    const usageHistory = await prisma.usageStats.findMany({
      where: { userId: user.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
    });

    // Calculate analytics summary
    const analyticsData = documents.map((doc) => doc.analytics).filter(Boolean);

    const avgReadabilityScore =
      analyticsData.length > 0
        ? analyticsData.reduce(
            (acc, a) => acc + (a!.readabilityScore || 0),
            0
          ) / analyticsData.length
        : 0;

    const avgImprovementScore =
      analyticsData.length > 0
        ? analyticsData.reduce(
            (acc, a) => acc + (a!.improvementScore || 0),
            0
          ) / analyticsData.length
        : 0;

    const totalGrammarIssuesFixed = analyticsData.reduce(
      (acc, a) => acc + (a?.grammarIssues || 0),
      0
    );
    const totalStyleImprovements = analyticsData.reduce(
      (acc, a) => acc + (a?.styleImprovements || 0),
      0
    );

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        wordCount: doc.wordCount,
        processingTime: doc.processingTime,
        mechanisms: JSON.parse(doc.mechanisms),
        createdAt: doc.createdAt,
        analytics: doc.analytics || null,
      })),
      pagination: {
        page,
        limit,
        total: totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
      },
      currentUsage: {
        wordsProcessed: currentUsage?.wordsProcessed || 0,
        documentsCount: currentUsage?.documentsCount || 0,
        timeSaved: currentUsage?.timeSaved || 0,
        wordLimit: 15000,
        wordsRemaining: 15000 - (currentUsage?.wordsProcessed || 0),
      },
      usageHistory: usageHistory.map((usage) => ({
        month: usage.month,
        year: usage.year,
        wordsProcessed: usage.wordsProcessed,
        documentsCount: usage.documentsCount,
        timeSaved: usage.timeSaved,
      })),
      analytics: {
        avgReadabilityScore: Math.round(avgReadabilityScore * 100) / 100,
        avgImprovementScore: Math.round(avgImprovementScore * 100) / 100,
        totalGrammarIssuesFixed,
        totalStyleImprovements,
        totalDocuments,
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
