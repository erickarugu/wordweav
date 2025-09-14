#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 *
 * This script migrates data from SQLite to PostgreSQL
 * Run this after setting up PostgreSQL and before running the new application
 */

import { PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

// SQLite connection (old database) - using better-sqlite3 directly
const sqliteDbPath = path.join(process.cwd(), "prisma", "dev.db");
let sqliteDb = null;

// PostgreSQL connection (new database) - using Prisma
const postgresClient = new PrismaClient();

async function migrateTables() {
  try {
    console.log("🚀 Starting data migration from SQLite to PostgreSQL...\n");

    // Check if SQLite database exists
    if (!fs.existsSync(sqliteDbPath)) {
      console.log("❌ SQLite database not found at:", sqliteDbPath);
      console.log(
        "✅ No data to migrate. You can proceed with the PostgreSQL setup."
      );
      return;
    }

    // Test connections
    console.log("📡 Testing database connections...");

    // Connect to SQLite
    sqliteDb = new Database(sqliteDbPath, { readonly: true });
    console.log("✅ SQLite connection established");

    // Connect to PostgreSQL
    await postgresClient.$connect();
    console.log("✅ PostgreSQL connection established\n");

    // Migrate Users
    console.log("📦 Migrating Users...");
    const users = sqliteDb.prepare("SELECT * FROM users").all();
    console.log(`   Found ${users.length} users`);

    for (const user of users) {
      try {
        await postgresClient.user.upsert({
          where: { id: user.id },
          update: {
            name: user.name,
            email: user.email,
            emailVerified: user.email_verified
              ? new Date(user.email_verified)
              : null,
            image: user.image,
            password: user.password,
            subscriptionId: user.subscription_id,
            subscriptionStatus: user.subscription_status,
            planType: user.plan_type,
            subscriptionStartDate: user.subscription_start_date
              ? new Date(user.subscription_start_date)
              : null,
            subscriptionEndDate: user.subscription_end_date
              ? new Date(user.subscription_end_date)
              : null,
            trialStartDate: user.trial_start_date
              ? new Date(user.trial_start_date)
              : null,
            trialEndDate: user.trial_end_date
              ? new Date(user.trial_end_date)
              : null,
            isOnTrial: user.is_on_trial === 1,
            customerId: user.customer_id,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.email_verified
              ? new Date(user.email_verified)
              : null,
            image: user.image,
            password: user.password,
            subscriptionId: user.subscription_id,
            subscriptionStatus: user.subscription_status,
            planType: user.plan_type,
            subscriptionStartDate: user.subscription_start_date
              ? new Date(user.subscription_start_date)
              : null,
            subscriptionEndDate: user.subscription_end_date
              ? new Date(user.subscription_end_date)
              : null,
            trialStartDate: user.trial_start_date
              ? new Date(user.trial_start_date)
              : null,
            trialEndDate: user.trial_end_date
              ? new Date(user.trial_end_date)
              : null,
            isOnTrial: user.is_on_trial === 1,
            customerId: user.customer_id,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          },
        });
      } catch (error) {
        console.log(`   ⚠️  Error migrating user ${user.id}:`, error.message);
      }
    }
    console.log("✅ Users migration completed\n");

    // Migrate Accounts
    console.log("📦 Migrating Accounts...");
    const accounts = sqliteDb.prepare("SELECT * FROM accounts").all();
    console.log(`   Found ${accounts.length} accounts`);

    for (const account of accounts) {
      try {
        await postgresClient.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.provider_account_id,
            },
          },
          update: {
            userId: account.user_id,
            type: account.type,
            access_token: account.access_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            session_state: account.session_state,
            token_type: account.token_type,
          },
          create: {
            id: account.id,
            userId: account.user_id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.provider_account_id,
            access_token: account.access_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            session_state: account.session_state,
            token_type: account.token_type,
          },
        });
      } catch (error) {
        console.log(
          `   ⚠️  Error migrating account ${account.id}:`,
          error.message
        );
      }
    }
    console.log("✅ Accounts migration completed\n");

    // Migrate Sessions
    console.log("📦 Migrating Sessions...");
    const sessions = sqliteDb.prepare("SELECT * FROM sessions").all();
    console.log(`   Found ${sessions.length} sessions`);

    for (const session of sessions) {
      try {
        await postgresClient.session.upsert({
          where: { sessionToken: session.session_token },
          update: {
            userId: session.user_id,
            expires: new Date(session.expires),
          },
          create: {
            id: session.id,
            sessionToken: session.session_token,
            userId: session.user_id,
            expires: new Date(session.expires),
          },
        });
      } catch (error) {
        console.log(
          `   ⚠️  Error migrating session ${session.id}:`,
          error.message
        );
      }
    }
    console.log("✅ Sessions migration completed\n");

    // Migrate Verification Tokens
    console.log("📦 Migrating Verification Tokens...");
    try {
      const verificationTokens = sqliteDb
        .prepare("SELECT * FROM verificationtokens")
        .all();
      console.log(`   Found ${verificationTokens.length} verification tokens`);

      for (const token of verificationTokens) {
        try {
          await postgresClient.verificationToken.upsert({
            where: {
              identifier_token: {
                identifier: token.identifier,
                token: token.token,
              },
            },
            update: {
              expires: new Date(token.expires),
            },
            create: {
              identifier: token.identifier,
              token: token.token,
              expires: new Date(token.expires),
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating verification token:`,
            error.message
          );
        }
      }
      console.log("✅ Verification tokens migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No verification tokens table found (skipping)\n");
    }

    // Migrate Documents
    console.log("📦 Migrating Documents...");
    try {
      const documents = sqliteDb.prepare("SELECT * FROM documents").all();
      console.log(`   Found ${documents.length} documents`);

      for (const doc of documents) {
        try {
          await postgresClient.document.upsert({
            where: { id: doc.id },
            update: {
              userId: doc.user_id,
              title: doc.title,
              originalText: doc.original_text,
              processedText: doc.processed_text,
              wordCount: doc.word_count,
              processingTime: doc.processing_time,
              mechanisms: doc.mechanisms,
              createdAt: new Date(doc.created_at),
              updatedAt: new Date(doc.updated_at),
            },
            create: {
              id: doc.id,
              userId: doc.user_id,
              title: doc.title,
              originalText: doc.original_text,
              processedText: doc.processed_text,
              wordCount: doc.word_count,
              processingTime: doc.processing_time,
              mechanisms: doc.mechanisms,
              createdAt: new Date(doc.created_at),
              updatedAt: new Date(doc.updated_at),
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating document ${doc.id}:`,
            error.message
          );
        }
      }
      console.log("✅ Documents migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No documents table found (skipping)\n");
    }

    // Migrate Usage Statistics
    console.log("📦 Migrating Usage Statistics...");
    try {
      const usageStats = sqliteDb.prepare("SELECT * FROM usage_stats").all();
      console.log(`   Found ${usageStats.length} usage statistics`);

      for (const stat of usageStats) {
        try {
          await postgresClient.usageStats.upsert({
            where: { id: stat.id },
            update: {
              userId: stat.user_id,
              month: stat.month,
              year: stat.year,
              wordsProcessed: stat.words_processed,
              documentsCount: stat.documents_count,
              timeSaved: stat.time_saved,
              createdAt: new Date(stat.created_at),
              updatedAt: new Date(stat.updated_at),
            },
            create: {
              id: stat.id,
              userId: stat.user_id,
              month: stat.month,
              year: stat.year,
              wordsProcessed: stat.words_processed,
              documentsCount: stat.documents_count,
              timeSaved: stat.time_saved,
              createdAt: new Date(stat.created_at),
              updatedAt: new Date(stat.updated_at),
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating usage stat ${stat.id}:`,
            error.message
          );
        }
      }
      console.log("✅ Usage statistics migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No usage statistics table found (skipping)\n");
    }

    // Migrate Document Analytics
    console.log("📦 Migrating Document Analytics...");
    try {
      const analytics = sqliteDb
        .prepare("SELECT * FROM document_analytics")
        .all();
      console.log(`   Found ${analytics.length} document analytics`);

      for (const analytic of analytics) {
        try {
          await postgresClient.documentAnalytics.upsert({
            where: { id: analytic.id },
            update: {
              documentId: analytic.document_id,
              readabilityScore: analytic.readability_score,
              sentimentScore: analytic.sentiment_score,
              complexityScore: analytic.complexity_score,
              improvementScore: analytic.improvement_score,
              keywordDensity: analytic.keyword_density,
              grammarIssues: analytic.grammar_issues,
              styleImprovements: analytic.style_improvements,
              wordsProcessed: analytic.words_processed,
              timeSaved: analytic.time_saved,
            },
            create: {
              id: analytic.id,
              documentId: analytic.document_id,
              readabilityScore: analytic.readability_score,
              sentimentScore: analytic.sentiment_score,
              complexityScore: analytic.complexity_score,
              improvementScore: analytic.improvement_score,
              keywordDensity: analytic.keyword_density,
              grammarIssues: analytic.grammar_issues,
              styleImprovements: analytic.style_improvements,
              wordsProcessed: analytic.words_processed,
              timeSaved: analytic.time_saved,
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating document analytics ${analytic.id}:`,
            error.message
          );
        }
      }
      console.log("✅ Document analytics migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No document analytics table found (skipping)\n");
    }

    // Migrate Payments
    console.log("📦 Migrating Payments...");
    try {
      const payments = sqliteDb.prepare("SELECT * FROM payments").all();
      console.log(`   Found ${payments.length} payments`);

      for (const payment of payments) {
        try {
          await postgresClient.payment.upsert({
            where: { id: payment.id },
            update: {
              userId: payment.user_id,
              paymentId: payment.payment_id,
              subscriptionId: payment.subscription_id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              description: payment.description,
              invoiceUrl: payment.invoice_url,
              paymentDate: new Date(payment.payment_date),
              createdAt: new Date(payment.created_at),
              updatedAt: new Date(payment.updated_at),
            },
            create: {
              id: payment.id,
              userId: payment.user_id,
              paymentId: payment.payment_id,
              subscriptionId: payment.subscription_id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              description: payment.description,
              invoiceUrl: payment.invoice_url,
              paymentDate: new Date(payment.payment_date),
              createdAt: new Date(payment.created_at),
              updatedAt: new Date(payment.updated_at),
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating payment ${payment.id}:`,
            error.message
          );
        }
      }
      console.log("✅ Payments migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No payments table found (skipping)\n");
    }

    // Migrate Newsletter Subscribers
    console.log("📦 Migrating Newsletter Subscribers...");
    try {
      const subscribers = sqliteDb
        .prepare("SELECT * FROM newsletter_subscribers")
        .all();
      console.log(`   Found ${subscribers.length} newsletter subscribers`);

      for (const subscriber of subscribers) {
        try {
          await postgresClient.newsletterSubscriber.upsert({
            where: { email: subscriber.email },
            update: {
              subscribedAt: new Date(subscriber.subscribed_at),
              isActive: subscriber.is_active === 1,
              unsubscribedAt: subscriber.unsubscribed_at
                ? new Date(subscriber.unsubscribed_at)
                : null,
              source: subscriber.source,
            },
            create: {
              id: subscriber.id,
              email: subscriber.email,
              subscribedAt: new Date(subscriber.subscribed_at),
              isActive: subscriber.is_active === 1,
              unsubscribedAt: subscriber.unsubscribed_at
                ? new Date(subscriber.unsubscribed_at)
                : null,
              source: subscriber.source,
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating subscriber ${subscriber.email}:`,
            error.message
          );
        }
      }
      console.log("✅ Newsletter subscribers migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No newsletter subscribers table found (skipping)\n");
    }

    // Migrate Password Reset Tokens
    console.log("📦 Migrating Password Reset Tokens...");
    try {
      const resetTokens = sqliteDb
        .prepare("SELECT * FROM password_reset_tokens")
        .all();
      console.log(`   Found ${resetTokens.length} password reset tokens`);

      for (const token of resetTokens) {
        try {
          await postgresClient.passwordResetToken.upsert({
            where: { id: token.id },
            update: {
              email: token.email,
              token: token.token,
              expiresAt: new Date(token.expires_at),
              createdAt: new Date(token.created_at),
              used: token.used === 1,
            },
            create: {
              id: token.id,
              email: token.email,
              token: token.token,
              expiresAt: new Date(token.expires_at),
              createdAt: new Date(token.created_at),
              used: token.used === 1,
            },
          });
        } catch (error) {
          console.log(
            `   ⚠️  Error migrating password reset token ${token.id}:`,
            error.message
          );
        }
      }
      console.log("✅ Password reset tokens migration completed\n");
    } catch (error) {
      console.log("   ℹ️  No password reset tokens table found (skipping)\n");
    }

    // Verification - check record counts
    console.log("🔍 Verifying migration...");

    const postgresUserCount = await postgresClient.user.count();
    const postgresAccountCount = await postgresClient.account.count();
    const postgresSessionCount = await postgresClient.session.count();

    console.log(`✅ PostgreSQL Users: ${postgresUserCount}`);
    console.log(`✅ PostgreSQL Accounts: ${postgresAccountCount}`);
    console.log(`✅ PostgreSQL Sessions: ${postgresSessionCount}`);

    try {
      const postgresDocCount = await postgresClient.document.count();
      console.log(`✅ PostgreSQL Documents: ${postgresDocCount}`);
    } catch (error) {
      console.log("   ℹ️  Documents table not available");
    }

    try {
      const postgresStatsCount = await postgresClient.usageStats.count();
      console.log(`✅ PostgreSQL Usage Stats: ${postgresStatsCount}`);
    } catch (error) {
      console.log("   ℹ️  Usage stats table not available");
    }

    try {
      const postgresAnalyticsCount =
        await postgresClient.documentAnalytics.count();
      console.log(
        `✅ PostgreSQL Document Analytics: ${postgresAnalyticsCount}`
      );
    } catch (error) {
      console.log("   ℹ️  Document analytics table not available");
    }

    try {
      const postgresPaymentCount = await postgresClient.payment.count();
      console.log(`✅ PostgreSQL Payments: ${postgresPaymentCount}`);
    } catch (error) {
      console.log("   ℹ️  Payments table not available");
    }

    try {
      const postgresSubscriberCount =
        await postgresClient.newsletterSubscriber.count();
      console.log(
        `✅ PostgreSQL Newsletter Subscribers: ${postgresSubscriberCount}`
      );
    } catch (error) {
      console.log("   ℹ️  Newsletter subscribers table not available");
    }

    try {
      const postgresResetTokenCount =
        await postgresClient.passwordResetToken.count();
      console.log(
        `✅ PostgreSQL Password Reset Tokens: ${postgresResetTokenCount}`
      );
    } catch (error) {
      console.log("   ℹ️  Password reset tokens table not available");
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("✅ Your data has been migrated to PostgreSQL");
    console.log("✅ You can now start using the application with PostgreSQL");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Clean up connections
    if (sqliteDb) {
      sqliteDb.close();
    }
    await postgresClient.$disconnect();
  }
}

// Run the migration
migrateTables()
  .then(() => {
    console.log("✅ Migration process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
