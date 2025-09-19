/**
 * Supabase Client Configuration
 *
 * Simple setup:
 * - Always connects to production Supabase
 * - Used only when NODE_ENV=production
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Always use production Supabase (simpler setup)
const supabaseUrl = process.env.SUPABASE_PROD_URL!;
const supabaseKey = process.env.SUPABASE_PROD_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase production configuration");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database configuration
export const dbConfig = {
  environment: "production",
  url: supabaseUrl,
  isProduction: process.env.NODE_ENV === "production",
};

console.log(`🚀 Supabase configured for production environment`);

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          emailVerified: string | null;
          createdAt: string;
          updatedAt: string;
          isOnTrial: boolean;
          trialStartDate: string | null;
          trialEndDate: string | null;
          subscriptionId: string | null;
          planId: string | null;
          planName: string | null;
          planPrice: number | null;
          billingCycle: string | null;
          subscriptionStatus: string | null;
          currentPeriodStart: string | null;
          currentPeriodEnd: string | null;
          monthlyWordCount: number;
          monthlyWordLimit: number;
          lastUsageReset: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          image?: string | null;
          emailVerified?: string | null;
          createdAt?: string;
          updatedAt?: string;
          isOnTrial?: boolean;
          trialStartDate?: string | null;
          trialEndDate?: string | null;
          subscriptionId?: string | null;
          planId?: string | null;
          planName?: string | null;
          planPrice?: number | null;
          billingCycle?: string | null;
          subscriptionStatus?: string | null;
          currentPeriodStart?: string | null;
          currentPeriodEnd?: string | null;
          monthlyWordCount?: number;
          monthlyWordLimit?: number;
          lastUsageReset?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          image?: string | null;
          emailVerified?: string | null;
          createdAt?: string;
          updatedAt?: string;
          isOnTrial?: boolean;
          trialStartDate?: string | null;
          trialEndDate?: string | null;
          subscriptionId?: string | null;
          planId?: string | null;
          planName?: string | null;
          planPrice?: number | null;
          billingCycle?: string | null;
          subscriptionStatus?: string | null;
          currentPeriodStart?: string | null;
          currentPeriodEnd?: string | null;
          monthlyWordCount?: number;
          monthlyWordLimit?: number;
          lastUsageReset?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          type?: string;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Insert: {
          id?: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Update: {
          id?: string;
          sessionToken?: string;
          userId?: string;
          expires?: string;
        };
      };
      verificationtokens: {
        Row: {
          identifier: string;
          token: string;
          expires: string;
        };
        Insert: {
          identifier: string;
          token: string;
          expires: string;
        };
        Update: {
          identifier?: string;
          token?: string;
          expires?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          originalText: string;
          processedText: string;
          wordCount: number;
          mechanisms: string[];
          userId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          title: string;
          originalText: string;
          processedText: string;
          wordCount: number;
          mechanisms?: string[];
          userId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          title?: string;
          originalText?: string;
          processedText?: string;
          wordCount?: number;
          mechanisms?: string[];
          userId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
};
