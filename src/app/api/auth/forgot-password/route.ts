import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete any existing reset tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: email.toLowerCase() },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          email: email.toLowerCase(),
          token,
          expiresAt,
        },
      });

      // Send reset email
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

      try {
        await sendResetPasswordEmail({
          to: user.email,
          name: user.name || "User",
          resetLink: resetUrl,
        });
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        // Clean up the token if email fails
        await prisma.passwordResetToken.delete({
          where: { token },
        });
        return NextResponse.json(
          { error: "Failed to send reset email. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent you a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
