import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEMON_SQUEEZY_CONFIG } from "@/lib/lemonsqueezy";
import { sendSubscriptionSuccessEmail } from "@/lib/email";
import crypto from "crypto";

// Helper function to verify webhook signature
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = Buffer.from(hmac.digest("hex"), "utf8");
  const checksum = Buffer.from(signature, "utf8");

  return crypto.timingSafeEqual(digest, checksum);
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-signature");
    const body = await request.text();

    if (!signature || !LEMON_SQUEEZY_CONFIG.webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    if (!verifySignature(body, signature, LEMON_SQUEEZY_CONFIG.webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    const eventName = event.meta?.event_name;
    const userEmail = event.data?.attributes?.user_email;

    // Get user_id from meta.custom_data (this is where it's stored in API-created checkouts)
    let customUserId = null;
    let customUserEmail = null;

    // Primary location: meta.custom_data (from API checkouts)
    const metaCustomData = event.meta?.custom_data;

    // Fallback locations for older webhooks
    const customData =
      metaCustomData ||
      event.data?.attributes?.first_subscription_item?.custom_data ||
      event.data?.attributes?.order_item?.custom_data ||
      event.data?.attributes?.custom_data ||
      event.data?.custom_data ||
      {};

    if (customData) {
      customUserId = customData.user_id;
      customUserEmail = customData.user_email;
    }

    // Prefer user_id from custom data (most reliable)
    let userId = customUserId;

    // Fallback: find user by email only if we don't have user_id
    if (!userId) {
      const emailToLookup = customUserEmail || userEmail;
      if (emailToLookup) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: emailToLookup },
          });
          if (user) {
            userId = user.id;
          }
        } catch (error) {
          console.error("Error finding user by email:", error);
        }
      }
    }

    if (!userId) {
      const fallbackEmail = customUserEmail || userEmail;
      console.log(
        `No user found - user_id: ${customUserId}, fallback email: ${fallbackEmail}`
      );
      // Still return success to Lemon Squeezy so webhook doesn't retry
      return NextResponse.json({
        received: true,
        message: `No user found - user_id: ${customUserId}, email: ${fallbackEmail}`,
      });
    }

    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(event, userId);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(event, userId);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(event, userId);
        break;

      case "subscription_resumed":
        await handleSubscriptionResumed(event, userId);
        break;

      case "subscription_expired":
        await handleSubscriptionExpired(event, userId);
        break;

      case "subscription_payment_success":
        await handlePaymentSuccess(event, userId);
        break;

      case "subscription_payment_failed":
        await handlePaymentFailed(event, userId);
        break;

      case "subscription_payment_refunded":
        await handlePaymentRefunded(event, userId);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

interface LemonSqueezyWebhookEvent {
  data: {
    id: string;
    attributes: {
      status: string;
      created_at: string;
      renews_at: string;
      ends_at?: string;
      trial_ends_at?: string;
      user_email: string;
      user_name: string;
      product_name: string;
      variant_name: string;
      order_id?: number;
      subtotal?: string;
      currency?: string;
      subscription_id?: string;
      urls?: {
        invoice_url?: string;
      };
    };
  };
  meta?: {
    event_name: string;
    test_mode?: boolean;
  };
}

async function handleSubscriptionCreated(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const subscription = event.data.attributes;

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  // Detect plan type from existing user data or subscription details
  const planType = user.planType || "monthly";

  // Log subscription details
  console.log("Processing subscription_created:", {
    subscriptionId: event.data.id,
    userEmail: subscription.user_email,
    productName: subscription.product_name,
    variantName: subscription.variant_name,
    status: subscription.status,
    trialEndsAt: subscription.trial_ends_at,
    planType,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionId: String(event.data.id), // Convert to string
      subscriptionStatus: subscription.status,
      subscriptionStartDate: new Date(subscription.created_at),
      subscriptionEndDate: new Date(subscription.renews_at),
      isOnTrial: subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at) > new Date()
        : false,
      trialEndDate: subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at)
        : null,
    },
  });

  // Send success email
  try {
    if (user.email) {
      await sendSubscriptionSuccessEmail({
        to: user.email,
        name: user.name || "there",
        planType: (planType as "monthly" | "yearly") || "monthly",
        trialEndDate: subscription.trial_ends_at,
      });
      console.log(`Success email sent to ${user.email}`);
    }
  } catch (emailError) {
    console.error("Failed to send success email:", emailError);
    // Don't fail the webhook if email fails
  }

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const subscription = event.data.attributes;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.renews_at),
      isOnTrial: subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at) > new Date()
        : false,
      trialEndDate: subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at)
        : null,
    },
  });

  console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionCancelled(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const subscription = event.data.attributes;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "cancelled",
      subscriptionEndDate: subscription.ends_at
        ? new Date(subscription.ends_at)
        : null,
      isOnTrial: false,
    },
  });

  console.log(`Subscription cancelled for user ${userId}`);
}

async function handleSubscriptionResumed(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const subscription = event.data.attributes;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      subscriptionEndDate: new Date(subscription.renews_at),
    },
  });

  console.log(`Subscription resumed for user ${userId}`);
}

async function handleSubscriptionExpired(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "expired",
      isOnTrial: false,
    },
  });

  console.log(`Subscription expired for user ${userId}`);
}

async function handlePaymentSuccess(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const payment = event.data.attributes;

  // Get user to determine plan type
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  // Check if payment already exists to avoid duplicates
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentId: String(event.data.id) },
  });

  if (existingPayment) {
    console.log(`Payment ${event.data.id} already exists, skipping creation`);
  } else {
    // Create payment record
    await prisma.payment.create({
      data: {
        userId: userId,
        paymentId: String(event.data.id), // Convert to string
        subscriptionId: payment.subscription_id
          ? String(payment.subscription_id)
          : user.subscriptionId || null,
        amount: payment.subtotal ? parseInt(payment.subtotal) : 0,
        currency: payment.currency || "usd",
        status: "succeeded",
        description: `Subscription payment - ${user.planType || "monthly"} plan`,
        invoiceUrl: payment.urls?.invoice_url,
        paymentDate: new Date(payment.created_at),
      },
    });
  }

  // Mark trial as ended if this is the first payment after trial
  if (user.isOnTrial) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnTrial: false,
        subscriptionStatus: "active",
      },
    });
  }
}

async function handlePaymentFailed(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const payment = event.data.attributes;

  // Get user to determine plan type
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  // Check if payment already exists to avoid duplicates
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentId: String(event.data.id) },
  });

  if (existingPayment) {
    console.log(
      `Failed payment ${event.data.id} already exists, updating status`
    );
    await prisma.payment.update({
      where: { paymentId: String(event.data.id) },
      data: {
        status: "failed",
        description: `Failed subscription payment - ${user.planType || "monthly"} plan`,
      },
    });
  } else {
    // Create failed payment record
    await prisma.payment.create({
      data: {
        userId: userId,
        paymentId: String(event.data.id), // Convert to string
        subscriptionId: payment.subscription_id
          ? String(payment.subscription_id)
          : user.subscriptionId || null,
        amount: payment.subtotal ? parseInt(payment.subtotal) : 0,
        currency: payment.currency || "usd",
        status: "failed",
        description: `Failed subscription payment - ${user.planType || "monthly"} plan`,
        paymentDate: new Date(payment.created_at),
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log(`Payment failed for user ${userId}`);
}

async function handlePaymentRefunded(
  event: LemonSqueezyWebhookEvent,
  userId: string
) {
  const payment = event.data.attributes;

  // Get user to determine plan type
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  // Update existing payment record or create refund record
  const existingPayment = await prisma.payment.findFirst({
    where: {
      paymentId: event.data.id,
      userId: userId,
    },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "refunded",
        description: `${existingPayment.description} (Refunded)`,
      },
    });
  } else {
    // Check if refund payment already exists
    const existingRefund = await prisma.payment.findUnique({
      where: { paymentId: String(event.data.id) },
    });

    if (existingRefund) {
      console.log(
        `Refund payment ${event.data.id} already exists, skipping creation`
      );
    } else {
      await prisma.payment.create({
        data: {
          userId: userId,
          paymentId: String(event.data.id), // Convert to string
          subscriptionId: payment.subscription_id
            ? String(payment.subscription_id)
            : user.subscriptionId || null,
          amount: payment.subtotal ? -parseInt(payment.subtotal) : 0, // Negative for refund
          currency: payment.currency || "usd",
          status: "refunded",
          description: `Refunded subscription payment - ${user.planType || "monthly"} plan`,
          paymentDate: new Date(payment.created_at),
        },
      });
    }
  }

  console.log(`Payment refunded for user ${userId}`);
}
