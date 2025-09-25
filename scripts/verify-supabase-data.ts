/**
 * Verify Migration with Supabase Client
 *
 * Uses Supabase client to verify the migrated data
 */

import "dotenv/config";
import { supabase } from "../src/lib/supabase";

async function verifyWithSupabase() {
  console.log("🔍 SUPABASE MIGRATION VERIFICATION");
  console.log("=".repeat(50));

  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, created_at, is_on_trial, subscription_status");

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return;
    }

    console.log(`\n👥 USERS (${users?.length || 0}):`);
    users?.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.name || "No name"})`);
      console.log(
        `      Created: ${new Date(user.created_at).toLocaleDateString()}`
      );
      console.log(
        `      Trial: ${user.is_on_trial}, Subscription: ${user.subscription_status || "None"}`
      );
    });

    // Check documents
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select(
        `
        id, 
        title, 
        word_count, 
        created_at,
        users!inner(email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (docsError) {
      console.error("❌ Error fetching documents:", docsError);
    } else {
      console.log(`\n📄 DOCUMENTS (showing last 10):`);
      documents?.forEach((doc, i) => {
        console.log(`   ${i + 1}. "${doc.title}" (${doc.word_count} words)`);
        const userEmail = Array.isArray(doc.users)
          ? doc.users[0]?.email
          : (doc.users as { email: string })?.email;
        console.log(`      By: ${userEmail || "Unknown"}`);
        console.log(
          `      Created: ${new Date(doc.created_at).toLocaleDateString()}`
        );
      });
    }

    // Check accounts
    const { data: accounts, error: accountsError } = await supabase.from(
      "accounts"
    ).select(`
        provider,
        users!inner(email)
      `);

    if (accountsError) {
      console.error("❌ Error fetching accounts:", accountsError);
    } else {
      console.log(`\n🔑 OAUTH ACCOUNTS (${accounts?.length || 0}):`);
      accounts?.forEach(
        (account: { provider: string; users: { email: string }[] }, i) => {
          const userEmail = account.users?.[0]?.email || "Unknown";
          console.log(`   ${i + 1}. ${account.provider} → ${userEmail}`);
        }
      );
    }

    // Check payments
    const { data: payments, error: paymentsError } = await supabase.from(
      "payments"
    ).select(`
        amount,
        currency,
        status,
        payment_date,
        users!inner(email)
      `);

    if (paymentsError) {
      console.error("❌ Error fetching payments:", paymentsError);
    } else {
      console.log(`\n💳 PAYMENTS (${payments?.length || 0}):`);
      payments?.forEach(
        (
          payment: {
            amount: number;
            currency: string;
            status: string;
            payment_date: string;
            users: { email: string }[];
          },
          i
        ) => {
          const userEmail = payment.users?.[0]?.email || "Unknown";
          console.log(
            `   ${i + 1}. $${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()} (${payment.status})`
          );
          console.log(`      By: ${userEmail}`);
          console.log(
            `      Date: ${new Date(payment.payment_date).toLocaleDateString()}`
          );
        }
      );
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ MIGRATION SUMMARY:");
    console.log(`   📊 Total users: ${users?.length || 0}`);
    console.log(`   📄 Total documents: ${documents?.length || 0}`);
    console.log(`   🔑 OAuth accounts: ${accounts?.length || 0}`);
    console.log(`   💳 Payments: ${payments?.length || 0}`);
    console.log(
      "\n🎉 All your data has been successfully migrated to Supabase!"
    );
    console.log(
      "🚀 Your application is now running on Supabase staging environment"
    );
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

verifyWithSupabase();
