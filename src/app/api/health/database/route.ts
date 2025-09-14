import { prisma, checkDatabaseHealth } from "@/lib/db";

interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  responseTime?: number;
  error?: string | null;
  data?: Record<string, unknown>;
  info?: string;
}

interface HealthChecks {
  [key: string]: HealthCheck;
}

export async function GET() {
  try {
    // Comprehensive health check
    const healthCheck = await performHealthCheck();

    const status = healthCheck.overall ? 200 : 503;

    return new Response(JSON.stringify(healthCheck), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return new Response(
      JSON.stringify({
        overall: false,
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function performHealthCheck() {
  const timestamp = new Date().toISOString();
  const checks: HealthChecks = {};

  // Database connectivity
  checks.database = {
    name: "Database Connection",
    status: "unknown",
    responseTime: 0,
    error: null,
  };

  const dbStart = Date.now();
  try {
    const isHealthy = await checkDatabaseHealth();
    checks.database.status = isHealthy ? "healthy" : "unhealthy";
    checks.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    checks.database.status = "unhealthy";
    checks.database.responseTime = Date.now() - dbStart;
    checks.database.error =
      error instanceof Error ? error.message : "Unknown error";
  }

  // Database metrics
  checks.metrics = {
    name: "Database Metrics",
    status: "unknown",
    data: {},
  };

  try {
    const metrics = await getDatabaseMetrics();
    checks.metrics.status = "healthy";
    checks.metrics.data = metrics;
  } catch (error) {
    checks.metrics.status = "unhealthy";
    checks.metrics.error =
      error instanceof Error ? error.message : "Unknown error";
  }

  // Connection pool status
  checks.connectionPool = {
    name: "Connection Pool",
    status: "healthy", // Prisma manages this automatically
    info: "Managed by Prisma Client",
  };

  // Overall health
  const overall = Object.values(checks).every(
    (check: HealthCheck) => check.status === "healthy"
  );

  return {
    overall,
    timestamp,
    checks,
  };
}

async function getDatabaseMetrics() {
  try {
    // Get basic table counts
    const [userCount, documentCount, sessionCount, usageStatsCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.document.count(),
        prisma.session.count(),
        prisma.usageStats.count(),
      ]);

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [recentDocuments, recentUsers] = await Promise.all([
      prisma.document.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      }),
    ]);

    return {
      tables: {
        users: userCount,
        documents: documentCount,
        sessions: sessionCount,
        usageStats: usageStatsCount,
      },
      recentActivity: {
        documentsLast24h: recentDocuments,
        usersLast24h: recentUsers,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get database metrics: ${error}`);
  }
}
