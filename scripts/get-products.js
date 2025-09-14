// Script to fetch all products from Lemon Squeezy
// Run this with: node scripts/get-products.js

import { config } from "dotenv";
config({ path: ".env.local" });

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

async function fetchProducts() {
  if (!LEMONSQUEEZY_API_KEY || !LEMONSQUEEZY_STORE_ID) {
    console.error(
      "Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID in .env.local"
    );
    return;
  }

  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/products?filter[store_id]=${LEMONSQUEEZY_STORE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("\n🍋 Found Products in your store:\n");

    data.data.forEach((product, index) => {
      console.log(`${index + 1}. Product: "${product.attributes.name}"`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: $${product.attributes.price}`);
      console.log(`   Status: ${product.attributes.status}`);
      console.log(`   Store URL: ${product.attributes.buy_now_url}`);
      console.log("");
    });

    console.log("\n📋 Environment Variables to add:");
    console.log("");

    const monthlyProduct = data.data.find(
      (p) =>
        p.attributes.name.toLowerCase().includes("monthly") ||
        p.attributes.name.toLowerCase().includes("month")
    );

    const yearlyProduct = data.data.find(
      (p) =>
        p.attributes.name.toLowerCase().includes("yearly") ||
        p.attributes.name.toLowerCase().includes("year")
    );

    if (monthlyProduct) {
      console.log(`LEMONSQUEEZY_MONTHLY_PRODUCT_ID=${monthlyProduct.id}`);
    }

    if (yearlyProduct) {
      console.log(`LEMONSQUEEZY_YEARLY_PRODUCT_ID=${yearlyProduct.id}`);
    }

    if (!monthlyProduct || !yearlyProduct) {
      console.log("\n⚠️  Could not auto-detect monthly/yearly products.");
      console.log(
        "Please manually identify which IDs correspond to your monthly and yearly plans from the list above."
      );
    }
  } catch (error) {
    console.error("Error fetching products:", error.message);
  }
}

fetchProducts();
