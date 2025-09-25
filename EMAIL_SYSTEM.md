# Email System Documentation

## Overview

WordWeave uses **Resend** for sending beautiful, branded emails with **React Email** templates. The system is designed to be maintainable, scalable, and matches the site's visual theme.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install resend react-email @react-email/components @react-email/render
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create a new API key in your dashboard
3. Add to your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

### 3. Domain Configuration

**For Development/Testing:**

- Uses `onboarding@resend.dev` (Resend's development domain)
- No domain verification required
- Perfect for testing email functionality

**For Production:**

1. Add your domain in Resend dashboard at [resend.com/domains](https://resend.com/domains)
2. Follow Resend's domain verification process (add DNS records)
3. The system automatically switches to your verified domain in production

**Current Configuration:**

- Development: `onboarding@resend.dev`
- Production: `welcome@wordweav.com` (update to your domain)

## Email Templates

### Welcome Email

- **File**: `/src/emails/WelcomeEmail.tsx`
- **Trigger**: Sent automatically when user registers
- **Features**:
  - Matches site's gradient theme
  - Feature highlights with icons
  - Clear call-to-action
  - Statistics and social proof
  - Mobile responsive

### Reset Password Email

- **File**: `/src/emails/ResetPasswordEmail.tsx`
- **Trigger**: When user requests password reset
- **Features**:
  - Security-focused design
  - Clear reset button
  - Expiration notice
  - Alternative text link

## Usage

### Sending Welcome Email

```typescript
import { sendWelcomeEmail } from "@/lib/email";

await sendWelcomeEmail({
  to: "user@example.com",
  name: "John Doe",
});
```

### Sending Reset Password Email

```typescript
import { sendResetPasswordEmail } from "@/lib/email";

await sendResetPasswordEmail({
  to: "user@example.com",
  name: "John Doe",
  resetLink: "https://yoursite.com/reset?token=abc123",
});
```

### Custom Emails

```typescript
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: "user@example.com",
  subject: "Custom Subject",
  html: "<h1>Custom HTML content</h1>",
  from: "Custom Sender <custom@yoursite.com>", // optional
});
```

## Testing

### Development Testing

- Visit `/email-test` in development mode
- Test sending emails without affecting users
- Preview emails at `/api/email/preview?name=TestName`

### Email Preview

- Access `/api/email/preview?name=YourName` to see email design
- Test with different names to see personalization
- No API key required for preview

## File Structure

```
src/
├── emails/
│   ├── WelcomeEmail.tsx      # Welcome email template
│   └── ResetPasswordEmail.tsx # Password reset template
├── lib/
│   └── email.ts              # Email service functions
├── app/
│   ├── api/
│   │   ├── email/
│   │   │   ├── preview/route.ts  # Email preview endpoint
│   │   │   └── test/route.ts     # Development testing endpoint
│   │   └── auth/
│   │       └── register/route.ts # Updated with welcome email
│   └── email-test/
│       └── page.tsx          # Development testing page
```

## Customization

### Brand Colors

The emails use your site's warm orange color scheme:

- Primary: `#f97316` (Vibrant orange)
- Secondary: `#f59e0b` (Golden amber)
- Accent: `#eab308` (Warm yellow)
- Text: `#9a3412` (Rich brown)
- Background: `#fef3c7` (Warm cream)
- Features: `#fef3c7` with `#fde68a` borders (Soft amber tones)

### Adding New Email Templates

1. Create new template in `/src/emails/`
2. Export new function in `/src/lib/email.ts`
3. Use React Email components for consistency
4. Follow existing styling patterns

### Styling Guidelines

- Use inline styles for email compatibility
- Maintain 600px max width for mobile
- Include alt text for images
- Test in multiple email clients

## Error Handling

- Registration continues even if email fails
- Comprehensive error logging
- Graceful fallbacks for production
- Development-only testing modes

## Security Features

- Environment-based API key management
- Domain verification for production
- Rate limiting through Resend
- Secure email delivery tracking

## Monitoring

- Email delivery status logging
- Error tracking and alerts
- Open/click tracking (via Resend dashboard)
- Bounce and complaint handling
