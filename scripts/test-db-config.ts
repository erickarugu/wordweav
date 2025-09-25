#!/usr/bin/env npx tsx
/**
 * Test Database Configuration
 *
 * This script tests the database environment configuration
 * to ensure proper switching between Supabase and PostgreSQL
 */

import "dotenv/config";
import { config } from "../src/lib/config";

async function testDatabaseConfiguration() {
  console.log("🧪 Testing Database Configuration");
  console.log("=====================================");

  console.log("\n📋 Environment Variables:");
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
  console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(
    `DATABASE_URL contains supabase: ${process.env.DATABASE_URL?.includes("supabase") || false}`
  );
  console.log(`SUPABASE_PROD_URL exists: ${!!process.env.SUPABASE_PROD_URL}`);
  console.log(`SUPABASE_PROD_KEY exists: ${!!process.env.SUPABASE_PROD_KEY}`);

  console.log("\n🔧 Configuration Output:");
  console.log(`Environment: ${config.environment}`);
  console.log(`Database Provider: ${config.database.provider}`);
  console.log(
    `Database URL (first 50 chars): ${config.database.url.substring(0, 50)}...`
  );
  console.log(`Supabase URL: ${config.supabase.url}`);

  console.log("\n📊 Feature Flags:");
  console.log(`Use Supabase Auth: ${config.features.useSupabaseAuth}`);
  console.log(`Use Supabase Storage: ${config.features.useSupabaseStorage}`);
  console.log(`Enable Analytics: ${config.features.enableAnalytics}`);
  console.log(`Enable Realtime: ${config.features.enableRealtime}`);

  console.log("\n✅ Configuration test completed!");

  // Test database connection based on provider
  if (config.database.provider === "supabase") {
    await testSupabaseConnection();
  } else {
    await testPrismaConnection();
  }
}

async function testSupabaseConnection() {
  console.log("\n🚀 Testing Supabase Connection...");
  try {
    const { supabase } = await import("../src/lib/supabase");

    // Simple connection test
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.log("   ⚠️  Supabase query error (tables may not exist yet):");
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`   ✅ Supabase connected successfully! User count: ${data}`);
    }
  } catch (error) {
    console.log("   ❌ Supabase connection failed:");
    console.log(`   Error: ${error}`);
  }
}

async function testPrismaConnection() {
  console.log("\n🗄️  Testing Prisma Connection...");
  try {
    const { prisma } = await import("../src/lib/db");

    // Simple connection test
    await prisma.$queryRaw`SELECT 1`;
    console.log("   ✅ Prisma connected successfully!");

    // Try to get user count
    const userCount = await prisma.user.count();
    console.log(`   📊 User count: ${userCount}`);
  } catch (error) {
    console.log("   ❌ Prisma connection failed:");
    console.log(`   Error: ${error}`);
  }
}

// Run the test
testDatabaseConfiguration().catch(console.error);
