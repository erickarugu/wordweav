# WordWeave Payment System with Lemon Squeezy

## Overview

We've implemented a complete payment system for WordWeave using Lemon Squeezy as the payment processor. The system features:

- **Individual Plan Only**: Removed team plans, focusing on solo creators
- **Flexible Pricing**: $9.99/month or $99.99/year (17% savings)
- **7-Day Free Trial**: No credit card required until trial ends
- **Automatic Billing**: Users are billed automatically after trial period

## System Architecture

### Database Schema

Added subscription fields to the User model:

- `subscriptionId`: Lemon Squeezy subscription ID
- `subscriptionStatus`: active, inactive, cancelled, etc.
- `planType`: monthly or yearly
- `subscriptionStartDate` & `subscriptionEndDate`: Subscription period
- `trialStartDate` & `trialEndDate`: Trial period tracking
- `isOnTrial`: Boolean flag for trial status
- `customerId`: Lemon Squeezy customer ID

### API Routes

#### `/api/payments/checkout` (POST)

Creates Lemon Squeezy checkout sessions for new subscriptions.

**Request Body:**

```json
{
  "planType": "monthly" | "yearly"
}
```

**Response:**

```json
{
  "checkoutUrl": "https://checkout.lemonsqueezy.com/...",
  "trialEndDate": "2025-09-21T..."
}
```

#### `/api/payments/webhook` (POST)

Handles Lemon Squeezy webhooks to update subscription status.

**Supported Events:**

- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_resumed`
- `subscription_expired`
- `subscription_payment_success`
- `subscription_payment_failed`

#### `/api/user/subscription` (GET)

Returns user's subscription and usage data.

**Response:**

```json
{
  "subscription": {
    "id": "sub_123",
    "plan": "monthly",
    "status": "active",
    "isOnTrial": true,
    "trialEndDate": "2025-09-21T..."
  },
  "usage": {
    "wordsUsedThisMonth": 5000,
    "wordsLimit": 15000,
    "documentsProcessed": 25,
    "timeSaved": 120
  }
}
```

## Frontend Components

### Landing Page (`/landing.tsx`)

- **Interactive plan selector**: Toggle between monthly/yearly
- **Dynamic pricing display**: Shows current plan price
- **Trial signup**: Starts 7-day free trial with Lemon Squeezy checkout

### Subscription Page (`/subscription/page.tsx`)

- **Subscription status**: Shows current plan and trial status
- **Usage tracking**: Visual progress bars for word limits
- **Plan management**: Upgrade/downgrade options
- **Trial information**: Clear messaging about trial end date

### Navigation

- Added "Subscription" link to authenticated user dropdown menu

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_MONTHLY_VARIANT_ID=your-monthly-variant-id
LEMONSQUEEZY_YEARLY_VARIANT_ID=your-yearly-variant-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

## Configuration Files

### `/src/lib/lemonsqueezy.ts`

Central configuration for Lemon Squeezy integration:

- API setup and authentication
- Product variant IDs
- Pricing constants
- Trial period configuration

## User Flow

### 1. Trial Signup

1. User visits landing page
2. Selects monthly or yearly plan
3. Clicks "Start 7-Day Free Trial"
4. Redirected to Lemon Squeezy checkout
5. Completes signup without payment method
6. Trial starts immediately, subscription created

### 2. Trial to Paid Conversion

1. User enters payment method during trial
2. Automatically billed when trial ends
3. Subscription status updated via webhook
4. `isOnTrial` flag set to false

### 3. Subscription Management

1. Users can view subscription status at `/subscription`
2. See usage statistics and limits
3. Manage billing through Lemon Squeezy customer portal

## Security Features

- **Webhook signature verification**: Validates all webhook requests
- **User authentication**: All subscription endpoints require authentication
- **Environment-based configuration**: Secure API key management
- **Error handling**: Comprehensive error logging and user feedback

## Pricing Structure

- **Monthly Plan**: $9.99/month
- **Yearly Plan**: $99.99/year (17% savings vs monthly)
- **Free Trial**: 7 days, no credit card required
- **Features**: 15,000 words/month, AI detection bypass, multiple writing styles

## Next Steps

To complete the setup:

1. **Create Lemon Squeezy account** and set up store
2. **Configure products** for monthly and yearly plans
3. **Set up webhook endpoint** in Lemon Squeezy dashboard
4. **Add environment variables** with actual Lemon Squeezy credentials
5. **Test payment flow** in sandbox mode
6. **Deploy to production** and switch to live mode

## Testing

The system includes comprehensive error handling and logging. Test scenarios:

- [ ] Free trial signup (monthly/yearly)
- [ ] Trial to paid conversion
- [ ] Subscription cancellation
- [ ] Payment failure handling
- [ ] Webhook processing
- [ ] Usage tracking and limits

## Notes

- The system is designed for individual users only
- Team features have been completely removed
- 7-day trial period is enforced automatically
- Billing happens through Lemon Squeezy's secure infrastructure
- All subscription data is synced via webhooks
