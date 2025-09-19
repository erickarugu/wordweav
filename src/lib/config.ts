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

  // Simple logic: production = Supabase, development = local PostgreSQL
  const environment = isProduction ? "production" : "local";

  // Get Supabase configuration (always use production Supabase)
  const supabaseUrl = process.env.SUPABASE_PROD_URL!;
  const supabaseKey = process.env.SUPABASE_PROD_KEY!;

  return {
    environment,
    database: {
      provider: isProduction ? "supabase" : "prisma",
      url: process.env.DATABASE_URL!,
    },
    supabase: {
      url: supabaseUrl,
      key: supabaseKey,
    },
    features: {
      useSupabaseAuth: isProduction,
      useSupabaseStorage: isProduction,
      enableAnalytics: isProduction,
      enableRealtime: isProduction,
    },
  };
}

export const config = getEnvironmentConfig();

// Log current configuration (only in development)
if (process.env.NODE_ENV !== "production") {
  console.log(`🔧 Environment: ${config.environment}`);
  console.log(`🗄️  Database provider: ${config.database.provider}`);
  console.log(`🚀 Supabase URL: ${config.supabase.url}`);
}
