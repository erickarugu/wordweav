import { lemonSqueezySetup as lsSetup } from "@lemonsqueezy/lemonsqueezy.js";

// Configure Lemon Squeezy
const apiKey = process.env.LEMONSQUEEZY_API_KEY;
const storeId = process.env.LEMONSQUEEZY_STORE_ID;

if (!apiKey) {
  throw new Error("LEMONSQUEEZY_API_KEY is required");
}

if (!storeId) {
  throw new Error("LEMONSQUEEZY_STORE_ID is required");
}

// Setup function for use in API routes
export function lemonSqueezySetup() {
  return lsSetup({
    apiKey,
    onError: (error) => {
      console.error("Lemon Squeezy API Error:", error);
    },
  });
}

// Initialize Lemon Squeezy on module load
lemonSqueezySetup();

export const LEMON_SQUEEZY_CONFIG = {
  storeId,
  products: {
    // These are the correct variant IDs that exist in the API
    monthlyPlanId: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID,
    yearlyPlanId: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID,
  },
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
};

export const TRIAL_DAYS = 7;
export const MONTHLY_PRICE = 9.99;
export const YEARLY_PRICE = 99.99;
