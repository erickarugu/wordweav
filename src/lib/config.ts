/**
 * Environment Configuration
 *
 * Simplified setup:
 * - Local development: PostgreSQL
 * - Production: Supabase
 */

interface EnvironmentConfig {
  environment: "local" | "production";
  database: {
    provider: "prisma" | "supabase";
    url: string;
  };
  supabase: {
    url: string;
    key: string;
  };
  features: {
    useSupabaseAuth: boolean;
    useSupabaseStorage: boolean;
    enableAnalytics: boolean;
    enableRealtime: boolean;
  };
}

function getEnvironmentConfig(): EnvironmentConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL!;

  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "DATABASE_URL contains 'supabase':",
    databaseUrl?.includes("supabase")
  );

  // Auto-detect if using Supabase based on DATABASE_URL
  const isUsingSupabase =
    databaseUrl?.includes("supabase.com") ||
    databaseUrl?.includes("supabase.co");

  // Environment detection
  const environment = isProduction ? "production" : "local";

  // Get Supabase configuration
  const supabaseUrl = process.env.SUPABASE_PROD_URL!;
  const supabaseKey = process.env.SUPABASE_PROD_KEY!;

  return {
    environment,
    database: {
      // Use supabase provider if DATABASE_URL points to Supabase, otherwise use prisma
      provider: isUsingSupabase ? "supabase" : "prisma",
      url: databaseUrl,
    },
    supabase: {
      url: supabaseUrl,
      key: supabaseKey,
    },
    features: {
      // Enable Supabase features based on whether we're using Supabase as database
      useSupabaseAuth: isUsingSupabase,
      useSupabaseStorage: isUsingSupabase,
      enableAnalytics: isProduction,
      enableRealtime: isUsingSupabase,
    },
  };
}

export const config = getEnvironmentConfig();

// Log current configuration (only in development)
if (process.env.NODE_ENV !== "production") {
  console.log(`🔧 Environment: ${config.environment}`);
  console.log(`🗄️  Database provider: ${config.database.provider}`);
  console.log(`🚀 Supabase URL: ${config.supabase.url}`);
  console.log(`📊 Features enabled:`, {
    supabaseAuth: config.features.useSupabaseAuth,
    supabaseStorage: config.features.useSupabaseStorage,
    realtime: config.features.enableRealtime,
  });
}
