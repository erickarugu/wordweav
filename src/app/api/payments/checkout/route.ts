import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { LEMON_SQUEEZY_CONFIG, TRIAL_DAYS } from "@/lib/lemonsqueezy";
import { prisma } from "@/lib/prisma";
import { withSecurity } from "@/lib/security";

// Payment checkout handler
async function checkoutHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !["monthly", "yearly"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already subscribed
    if (user.subscriptionStatus === "active") {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    // Get the correct variant ID
    const variantId =
      planType === "monthly"
        ? LEMON_SQUEEZY_CONFIG.products.monthlyPlanId
        : LEMON_SQUEEZY_CONFIG.products.yearlyPlanId;

    if (!variantId) {
      console.error("Missing variant ID for plan:", planType);
      console.error("Config:", LEMON_SQUEEZY_CONFIG.products);
      return NextResponse.json(
        { error: "Product variant not configured" },
        { status: 500 }
      );
    }

    // Calculate trial end date
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

    // Update user trial status immediately
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnTrial: true,
        trialStartDate: new Date(),
        trialEndDate,
        planType,
      },
    });

    // Use API-based checkout - no URL parameters needed
    try {
      const checkoutData = {
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              enabled_variants: [variantId],
              redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
            },
            checkout_data: {
              email: user.email,
              name: user.name || "",
              // Custom data for webhook identification
              custom: {
                user_id: user.id,
                user_email: user.email,
                plan_type: planType,
                user_name: user.name || "",
              },
            },
            expires_at: null,
            preview: false,
            test_mode: true, // Set to false for production
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: LEMON_SQUEEZY_CONFIG.storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      };

      console.log(
        "Sending checkout request:",
        JSON.stringify(checkoutData, null, 2)
      );

      const response = await fetch(
        "https://api.lemonsqueezy.com/v1/checkouts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
          },
          body: JSON.stringify(checkoutData),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Lemon Squeezy API Error:", response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const checkoutResponse = await response.json();
      console.log("Checkout API response:", checkoutResponse);

      const checkoutUrl = checkoutResponse.data.attributes.url;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from API");
      }

      return NextResponse.json({
        checkoutUrl,
        trialEndDate: trialEndDate.toISOString(),
        message: "Trial started! Complete payment to continue after 7 days.",
      });
    } catch (apiError) {
      console.error("API checkout failed:", apiError);
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details:
            apiError instanceof Error ? apiError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Checkout creation error:", error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Apply security middleware with payment rate limiting (10 requests per minute)
export const POST = withSecurity(checkoutHandler, {
  csrf: { enabled: false }, // Temporarily disable CSRF for debugging
  authentication: { required: true },
  rateLimit: { enabled: true, limiter: "payment" },
  headers: {
    validateOrigin: false, // Temporarily disable origin validation for debugging
    requireUserAgent: true,
    requireSecureHeaders: false,
  },
});
