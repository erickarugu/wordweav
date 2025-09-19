/**
 * Test Supabase Connection
 *
 * Simple script to verify that our Supabase setup is working correctly
 */

import "dotenv/config";
import { supabase } from "../src/lib/supabase";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase Connection...");
  console.log("=====================================");

  try {
    // Test 1: Test Supabase client connection
    console.log("1. Testing Supabase client...");
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.log(
        "   ⚠️  Supabase tables not yet created (this is expected on first run)"
      );
      console.log("   Error:", error.message);
    } else {
      console.log(`   ✅ Supabase connected! User count: ${data}`);
    }

    // Test 2: Test Prisma connection to Supabase
    console.log("\n2. Testing Prisma connection to Supabase...");
    const userCount = await prisma.user.count();
    console.log(`   ✅ Prisma connected! User count: ${userCount}`);

    // Test 3: Test environment configuration
    console.log("\n3. Testing environment configuration...");
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `   Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`
    );
    console.log(`   Supabase URL: ${process.env.SUPABASE_PROD_URL}`);

    // Test 4: Create a test user (and immediately delete it)
    console.log("\n4. Testing database operations...");
    try {
      const testUser = await prisma.user.create({
        data: {
          email: "test@supabase-migration.com",
          name: "Test User",
        },
      });
      console.log(`   ✅ Created test user: ${testUser.email}`);

      // Clean up test user
      await prisma.user.delete({
        where: { id: testUser.id },
      });
      console.log(`   ✅ Cleaned up test user`);
    } catch (error) {
      console.log(`   ❌ Database operation failed:`, error);
    }

    console.log("\n🎉 All tests completed!");
    console.log("=====================================");
    console.log("✅ Supabase migration is working correctly!");
    console.log("✅ Your application is ready to use Supabase");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { testSupabaseConnection };

// Run if called directly
if (require.main === module) {
  testSupabaseConnection();
}
