import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import SubscriptionSuccessEmail from "@/emails/SubscriptionSuccessEmail";

// Check if API key is available
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("⚠️ RESEND_API_KEY not found in environment variables");
}

const resend = new Resend(apiKey);

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
}

export interface SendResetPasswordEmailParams {
  to: string;
  name: string;
  resetLink: string;
}

export interface SendSubscriptionSuccessEmailParams {
  to: string;
  name: string;
  planType: "monthly" | "yearly";
  trialEndDate?: string;
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured. Please add it to your .env.local file."
      );
    }

    const emailHtml = await render(WelcomeEmail({ name }));

    // Use onboarding@resend.dev for development/testing
    // Update this to your verified domain in production
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? "WordWeave <welcome@wordweave.app>"
        : "WordWeave <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "🎉 Welcome to WordWeave - Transform Your Writing Today!",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(
        `Failed to send welcome email: ${error.message || JSON.stringify(error)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

export async function sendSubscriptionSuccessEmail({
  to,
  name,
  planType,
  trialEndDate,
}: SendSubscriptionSuccessEmailParams) {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured. Please add it to your .env.local file."
      );
    }

    const emailHtml = await render(
      SubscriptionSuccessEmail({ name, planType, trialEndDate })
    );

    // Use onboarding@resend.dev for development/testing
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? "WordWeave <welcome@wordweave.app>"
        : "WordWeave <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "🎉 Welcome to WordWeave! Your subscription is confirmed",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(
        `Failed to send subscription success email: ${error.message || JSON.stringify(error)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to send subscription success email:", error);
    throw error;
  }
}

export async function sendResetPasswordEmail({
  to,
  name,
  resetLink,
}: SendResetPasswordEmailParams) {
  try {
    const emailHtml = await render(ResetPasswordEmail({ name, resetLink }));

    // Use onboarding@resend.dev for development/testing
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? "WordWeave <security@wordweave.app>"
        : "Acme <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "🔐 Reset Your WordWeave Password",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      throw new Error(
        `Failed to send reset password email: ${error.message || JSON.stringify(error)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    throw error;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.NODE_ENV === "production"
    ? "WordWeave <noreply@wordweave.app>"
    : "WordWeave <onboarding@resend.dev>",
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error(
        `Failed to send email: ${error.message || JSON.stringify(error)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
