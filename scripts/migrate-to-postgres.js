#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 *
 * This script migrates data from SQLite to PostgreSQL
 * Run this after setting up PostgreSQL and before running the new application
 */

const { PrismaClient: SQLitePrismaClient } = require("@prisma/client");
const { PrismaClient: PostgresPrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// SQLite connection (old database)
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db",
    },
  },
});

// PostgreSQL connection (new database)
const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function migrateTables() {
  try {
    console.log("🚀 Starting data migration from SQLite to PostgreSQL...\n");

    // Check if SQLite database exists
    const sqliteDbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(sqliteDbPath)) {
      console.log("❌ SQLite database not found at:", sqliteDbPath);
      console.log(
        "✅ No data to migrate. You can proceed with the PostgreSQL setup."
      );
      return;
    }

    // Test connections
    console.log("📡 Testing database connections...");
    await sqliteClient.$connect();
    await postgresClient.$connect();
    console.log("✅ Database connections established\n");

    // Migrate data table by table
    await migrateUsers();
    await migrateAccounts();
    await migrateSessions();
    await migrateDocuments();
    await migrateUsageStats();
    await migrateNewsletterSubscribers();

    console.log("\n🎉 Migration completed successfully!");
    console.log(
      "💡 You can now delete the SQLite database file if everything looks good."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

async function migrateUsers() {
  try {
    const users = await sqliteClient.user.findMany();
    console.log(`📤 Migrating ${users.length} users...`);

    if (users.length > 0) {
      // Use createMany for batch insert
      await postgresClient.user.createMany({
        data: users,
        skipDuplicates: true,
      });
    }

    console.log("✅ Users migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating users:", error);
    throw error;
  }
}

async function migrateAccounts() {
  try {
    const accounts = await sqliteClient.account.findMany();
    console.log(`📤 Migrating ${accounts.length} accounts...`);

    if (accounts.length > 0) {
      await postgresClient.account.createMany({
        data: accounts,
        skipDuplicates: true,
      });
    }

    console.log("✅ Accounts migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating accounts:", error);
    throw error;
  }
}

async function migrateSessions() {
  try {
    const sessions = await sqliteClient.session.findMany();
    console.log(`📤 Migrating ${sessions.length} sessions...`);

    if (sessions.length > 0) {
      await postgresClient.session.createMany({
        data: sessions,
        skipDuplicates: true,
      });
    }

    console.log("✅ Sessions migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating sessions:", error);
    throw error;
  }
}

async function migrateDocuments() {
  try {
    const documents = await sqliteClient.document.findMany();
    console.log(`📤 Migrating ${documents.length} documents...`);

    if (documents.length > 0) {
      await postgresClient.document.createMany({
        data: documents,
        skipDuplicates: true,
      });
    }

    console.log("✅ Documents migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating documents:", error);
    throw error;
  }
}

async function migrateUsageStats() {
  try {
    const usageStats = await sqliteClient.usageStats.findMany();
    console.log(`📤 Migrating ${usageStats.length} usage stats...`);

    if (usageStats.length > 0) {
      await postgresClient.usageStats.createMany({
        data: usageStats,
        skipDuplicates: true,
      });
    }

    console.log("✅ Usage stats migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating usage stats:", error);
    throw error;
  }
}

async function migrateNewsletterSubscribers() {
  try {
    const subscribers = await sqliteClient.newsletterSubscriber.findMany();
    console.log(`📤 Migrating ${subscribers.length} newsletter subscribers...`);

    if (subscribers.length > 0) {
      await postgresClient.newsletterSubscriber.createMany({
        data: subscribers,
        skipDuplicates: true,
      });
    }

    console.log("✅ Newsletter subscribers migrated successfully");
  } catch (error) {
    console.error("❌ Error migrating newsletter subscribers:", error);
    throw error;
  }
}

// Verify migration
async function verifyMigration() {
  console.log("\n🔍 Verifying migration...");

  try {
    const sqliteUserCount = await sqliteClient.user.count();
    const postgresUserCount = await postgresClient.user.count();

    const sqliteDocCount = await sqliteClient.document.count();
    const postgresDocCount = await postgresClient.document.count();

    console.log(
      "User counts - SQLite:",
      sqliteUserCount,
      "PostgreSQL:",
      postgresUserCount
    );
    console.log(
      "Document counts - SQLite:",
      sqliteDocCount,
      "PostgreSQL:",
      postgresDocCount
    );

    if (
      sqliteUserCount === postgresUserCount &&
      sqliteDocCount === postgresDocCount
    ) {
      console.log("✅ Migration verification successful!");
    } else {
      console.log(
        "⚠️  Warning: Data counts don't match. Please review the migration."
      );
    }
  } catch (error) {
    console.error("❌ Error verifying migration:", error);
  }
}

// Run migration
if (require.main === module) {
  migrateTables()
    .then(() => verifyMigration())
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateTables, verifyMigration };
