/**
 * Database Service Layer
 *
 * Simple switching between:
 * - Local PostgreSQL (development)
 * - Supabase (production)
 */

import { supabase } from "./supabase";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client for local development
const prisma = new PrismaClient();

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isOnTrial: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  planType: string | null;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  customerId: string | null;
  password: string | null;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  processedText: string;
  wordCount: number;
  processingTime: number;
  mechanisms: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  id: string;
  userId: string;
  month: number;
  year: number;
  wordsProcessed: number;
  documentsCount: number;
  timeSaved: number;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseService {
  // Simple logic: production = Supabase, development = local PostgreSQL
  private useSupabase = process.env.NODE_ENV === "production";

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("users")
        .insert({
          email: userData.email!,
          name: userData.name,
          image: userData.image,
          email_verified: userData.emailVerified,
          password: userData.password,
          is_on_trial: userData.isOnTrial || false,
          trial_start_date: userData.trialStartDate,
          trial_end_date: userData.trialEndDate,
          subscription_id: userData.subscriptionId,
          subscription_status: userData.subscriptionStatus,
          plan_type: userData.planType,
          subscription_start_date: userData.subscriptionStartDate,
          subscription_end_date: userData.subscriptionEndDate,
          customer_id: userData.customerId,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSupabaseUser(data);
    } else {
      const user = await prisma.user.create({
        data: {
          email: userData.email!,
          name: userData.name,
          image: userData.image,
          emailVerified: userData.emailVerified,
          password: userData.password,
          isOnTrial: userData.isOnTrial || false,
          trialStartDate: userData.trialStartDate,
          trialEndDate: userData.trialEndDate,
          subscriptionId: userData.subscriptionId,
          subscriptionStatus: userData.subscriptionStatus,
          planType: userData.planType,
          subscriptionStartDate: userData.subscriptionStartDate,
          subscriptionEndDate: userData.subscriptionEndDate,
          customerId: userData.customerId,
        },
      });
      return user;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return this.mapSupabaseUser(data);
    } else {
      return await prisma.user.findUnique({
        where: { email },
      });
    }
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return this.mapSupabaseUser(data);
    } else {
      return await prisma.user.findUnique({
        where: { id },
      });
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("users")
        .update({
          name: userData.name,
          image: userData.image,
          email_verified: userData.emailVerified,
          is_on_trial: userData.isOnTrial,
          trial_start_date: userData.trialStartDate,
          trial_end_date: userData.trialEndDate,
          subscription_id: userData.subscriptionId,
          subscription_status: userData.subscriptionStatus,
          plan_type: userData.planType,
          subscription_start_date: userData.subscriptionStartDate,
          subscription_end_date: userData.subscriptionEndDate,
          customer_id: userData.customerId,
          updated_at: new Date(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapSupabaseUser(data);
    } else {
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    }
  }

  // Document operations
  async createDocument(documentData: Partial<Document>): Promise<Document> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: documentData.userId!,
          title: documentData.title!,
          original_text: documentData.originalText!,
          processed_text: documentData.processedText!,
          word_count: documentData.wordCount!,
          processing_time: documentData.processingTime || 0,
          mechanisms: documentData.mechanisms || "[]",
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSupabaseDocument(data);
    } else {
      return await prisma.document.create({
        data: {
          userId: documentData.userId!,
          title: documentData.title!,
          originalText: documentData.originalText!,
          processedText: documentData.processedText!,
          wordCount: documentData.wordCount!,
          processingTime: documentData.processingTime || 0,
          mechanisms: documentData.mechanisms || "[]",
        },
      });
    }
  }

  async findDocumentsByUserId(userId: string, limit = 50): Promise<Document[]> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.map(this.mapSupabaseDocument);
    } else {
      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return documents;
    }
  }

  // Usage stats operations
  async createOrUpdateUsageStats(
    userId: string,
    month: number,
    year: number,
    wordsProcessed: number,
    documentsCount: number,
    timeSaved: number
  ): Promise<UsageStats> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("usage_stats")
        .upsert({
          user_id: userId,
          month,
          year,
          words_processed: wordsProcessed,
          documents_count: documentsCount,
          time_saved: timeSaved,
          updated_at: new Date(),
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSupabaseUsageStats(data);
    } else {
      return await prisma.usageStats.upsert({
        where: {
          userId_month_year: { userId, month, year },
        },
        update: {
          wordsProcessed,
          documentsCount,
          timeSaved,
          updatedAt: new Date(),
        },
        create: {
          userId,
          month,
          year,
          wordsProcessed,
          documentsCount,
          timeSaved,
        },
      });
    }
  }

  async getUserUsageStats(userId: string, year: number): Promise<UsageStats[]> {
    if (this.useSupabase) {
      const { data, error } = await supabase
        .from("usage_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("year", year)
        .order("month");

      if (error) throw error;
      return data.map(this.mapSupabaseUsageStats);
    } else {
      return await prisma.usageStats.findMany({
        where: { userId, year },
        orderBy: { month: "asc" },
      });
    }
  }

  // Helper methods to map Supabase data to our types
  private mapSupabaseUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      image: data.image,
      emailVerified: data.email_verified ? new Date(data.email_verified) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isOnTrial: data.is_on_trial,
      trialStartDate: data.trial_start_date
        ? new Date(data.trial_start_date)
        : null,
      trialEndDate: data.trial_end_date ? new Date(data.trial_end_date) : null,
      subscriptionId: data.subscription_id,
      subscriptionStatus: data.subscription_status,
      planType: data.plan_type,
      subscriptionStartDate: data.subscription_start_date
        ? new Date(data.subscription_start_date)
        : null,
      subscriptionEndDate: data.subscription_end_date
        ? new Date(data.subscription_end_date)
        : null,
      customerId: data.customer_id,
      password: data.password,
    };
  }

  private mapSupabaseDocument(data: any): Document {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      originalText: data.original_text,
      processedText: data.processed_text,
      wordCount: data.word_count,
      processingTime: data.processing_time,
      mechanisms: data.mechanisms,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapSupabaseUsageStats(data: any): UsageStats {
    return {
      id: data.id,
      userId: data.user_id,
      month: data.month,
      year: data.year,
      wordsProcessed: data.words_processed,
      documentsCount: data.documents_count,
      timeSaved: data.time_saved,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Cleanup method
  async disconnect(): Promise<void> {
    if (!this.useSupabase) {
      await prisma.$disconnect();
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();

// For backward compatibility, also export individual methods
export const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createDocument,
  findDocumentsByUserId,
  createOrUpdateUsageStats,
  getUserUsageStats,
} = db;
