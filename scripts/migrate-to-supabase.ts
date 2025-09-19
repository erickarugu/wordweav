/**
 * Migration Script: Local PostgreSQL to Supabase
 *
 * This script migrates all existing data from the local PostgreSQL database
 * to the Supabase production environment, preserving all relationships and data integrity.
 */

import { PrismaClient } from "@prisma/client";
import { supabase } from "../src/lib/supabase";

// Create Prisma client specifically for LOCAL database (source)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@localhost:5432/wordweaves?sslmode=disable",
    },
  },
});

async function migrateToSupabase() {
  console.log(
    "🚀 Starting migration from local PostgreSQL to Supabase production..."
  );

  try {
    // 1. Migrate Users first (as they are referenced by other tables)
    console.log("📄 Migrating users...");
    const users = await localPrisma.user.findMany();

    for (const user of users) {
      const { error: userError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        email_verified: user.emailVerified,
        password: user.password,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        subscription_id: user.subscriptionId,
        subscription_status: user.subscriptionStatus,
        plan_type: user.planType,
        subscription_start_date: user.subscriptionStartDate,
        subscription_end_date: user.subscriptionEndDate,
        trial_start_date: user.trialStartDate,
        trial_end_date: user.trialEndDate,
        is_on_trial: user.isOnTrial,
        customer_id: user.customerId,
      });

      if (userError) {
        console.error(
          `❌ Error migrating user ${user.email}:`,
          userError.message
        );
        continue;
      }
      console.log(`✅ Migrated user: ${user.email}`);
    }

    // 2. Migrate Accounts
    console.log("🔑 Migrating accounts...");
    const accounts = await localPrisma.account.findMany();

    for (const account of accounts) {
      const { error: accountError } = await supabase.from("accounts").upsert({
        id: account.id,
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });

      if (accountError) {
        console.error(`❌ Error migrating account:`, accountError.message);
        continue;
      }
    }
    console.log(`✅ Migrated ${accounts.length} accounts`);

    // 3. Migrate Sessions
    console.log("🔐 Migrating sessions...");
    const sessions = await localPrisma.session.findMany();

    for (const session of sessions) {
      const { error: sessionError } = await supabase.from("sessions").upsert({
        id: session.id,
        session_token: session.sessionToken,
        user_id: session.userId,
        expires: session.expires,
      });

      if (sessionError) {
        console.error(`❌ Error migrating session:`, sessionError.message);
        continue;
      }
    }
    console.log(`✅ Migrated ${sessions.length} sessions`);

    // 4. Migrate Documents
    console.log("📄 Migrating documents...");
    const documents = await localPrisma.document.findMany({
      include: {
        analytics: true,
      },
    });

    for (const document of documents) {
      const { error: docError } = await supabase.from("documents").upsert({
        id: document.id,
        user_id: document.userId,
        title: document.title,
        original_text: document.originalText,
        processed_text: document.processedText,
        word_count: document.wordCount,
        processing_time: document.processingTime,
        mechanisms: document.mechanisms,
        created_at: document.createdAt,
        updated_at: document.updatedAt,
      });

      if (docError) {
        console.error(`❌ Error migrating document:`, docError.message);
        continue;
      }

      // Migrate document analytics if they exist
      if (document.analytics) {
        const { error: analyticsError } = await supabase
          .from("document_analytics")
          .upsert({
            id: document.analytics.id,
            document_id: document.analytics.documentId,
            readability_score: document.analytics.readabilityScore,
            sentiment_score: document.analytics.sentimentScore,
            complexity_score: document.analytics.complexityScore,
            improvement_score: document.analytics.improvementScore,
            keyword_density: document.analytics.keywordDensity,
            grammar_issues: document.analytics.grammarIssues,
            style_improvements: document.analytics.styleImprovements,
            words_processed: document.analytics.wordsProcessed,
            time_saved: document.analytics.timeSaved,
          });

        if (analyticsError) {
          console.error(
            `❌ Error migrating document analytics:`,
            analyticsError.message
          );
        }
      }
    }
    console.log(`✅ Migrated ${documents.length} documents`);

    // 5. Migrate Payments
    console.log("💳 Migrating payments...");
    const payments = await localPrisma.payment.findMany();

    for (const payment of payments) {
      const { error: paymentError } = await supabase.from("payments").upsert({
        id: payment.id,
        user_id: payment.userId,
        payment_id: payment.paymentId,
        subscription_id: payment.subscriptionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        invoice_url: payment.invoiceUrl,
        payment_date: payment.paymentDate,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
      });

      if (paymentError) {
        console.error(`❌ Error migrating payment:`, paymentError.message);
        continue;
      }
    }
    console.log(`✅ Migrated ${payments.length} payments`);

    // 6. Migrate Usage Stats
    console.log("📊 Migrating usage stats...");
    const usageStats = await localPrisma.usageStats.findMany();

    for (const stat of usageStats) {
      const { error: statError } = await supabase.from("usage_stats").upsert({
        id: stat.id,
        user_id: stat.userId,
        month: stat.month,
        year: stat.year,
        words_processed: stat.wordsProcessed,
        documents_count: stat.documentsCount,
        time_saved: stat.timeSaved,
        created_at: stat.createdAt,
        updated_at: stat.updatedAt,
      });

      if (statError) {
        console.error(`❌ Error migrating usage stat:`, statError.message);
        continue;
      }
    }
    console.log(`✅ Migrated ${usageStats.length} usage stats`);

    // 7. Migrate Verification Tokens
    console.log("🔗 Migrating verification tokens...");
    const verificationTokens = await localPrisma.verificationToken.findMany();

    for (const token of verificationTokens) {
      const { error: tokenError } = await supabase
        .from("verificationtokens")
        .upsert({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        });

      if (tokenError) {
        console.error(
          `❌ Error migrating verification token:`,
          tokenError.message
        );
        continue;
      }
    }
    console.log(`✅ Migrated ${verificationTokens.length} verification tokens`);

    // 8. Migrate Newsletter Subscribers
    console.log("📧 Migrating newsletter subscribers...");
    const newsletterSubscribers =
      await localPrisma.newsletterSubscriber.findMany();

    for (const subscriber of newsletterSubscribers) {
      const { error: subscriberError } = await supabase
        .from("newsletter_subscribers")
        .upsert({
          id: subscriber.id,
          email: subscriber.email,
          subscribed_at: subscriber.subscribedAt,
          is_active: subscriber.isActive,
          unsubscribed_at: subscriber.unsubscribedAt,
          source: subscriber.source,
        });

      if (subscriberError) {
        console.error(
          `❌ Error migrating newsletter subscriber:`,
          subscriberError.message
        );
        continue;
      }
    }
    console.log(
      `✅ Migrated ${newsletterSubscribers.length} newsletter subscribers`
    );

    // 9. Migrate Password Reset Tokens
    console.log("🔑 Migrating password reset tokens...");
    const passwordResetTokens = await localPrisma.passwordResetToken.findMany();

    for (const resetToken of passwordResetTokens) {
      const { error: resetTokenError } = await supabase
        .from("password_reset_tokens")
        .upsert({
          id: resetToken.id,
          email: resetToken.email,
          token: resetToken.token,
          expires_at: resetToken.expiresAt,
          created_at: resetToken.createdAt,
          used: resetToken.used,
        });

      if (resetTokenError) {
        console.error(
          `❌ Error migrating password reset token:`,
          resetTokenError.message
        );
        continue;
      }
    }
    console.log(
      `✅ Migrated ${passwordResetTokens.length} password reset tokens`
    );

    console.log("🎉 Migration completed successfully!");
    console.log("📋 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Accounts: ${accounts.length}`);
    console.log(`   - Sessions: ${sessions.length}`);
    console.log(`   - Documents: ${documents.length}`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`   - Usage Stats: ${usageStats.length}`);
    console.log(`   - Verification Tokens: ${verificationTokens.length}`);
    console.log(`   - Newsletter Subscribers: ${newsletterSubscribers.length}`);
    console.log(`   - Password Reset Tokens: ${passwordResetTokens.length}`);
  } catch (error) {
    console.error("💥 Migration failed:", error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
  }
}

// Verify migration
async function verifyMigration() {
  console.log("🔍 Verifying migration...");

  try {
    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: documentCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    console.log("✅ Verification Results:");
    console.log(`   - Users in Supabase: ${userCount}`);
    console.log(`   - Documents in Supabase: ${documentCount}`);
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

// Run migration
if (require.main === module) {
  migrateToSupabase()
    .then(() => verifyMigration())
    .catch(console.error);
}

export { migrateToSupabase, verifyMigration };
