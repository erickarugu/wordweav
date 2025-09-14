import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface SubscriptionSuccessEmailProps {
  name: string;
  planType: "monthly" | "yearly";
  trialEndDate?: string;
}

export default function SubscriptionSuccessEmail({
  name,
  planType,
  trialEndDate,
}: SubscriptionSuccessEmailProps) {
  const planName = planType === "monthly" ? "Monthly" : "Yearly";
  const planPrice = planType === "monthly" ? "$9.99/month" : "$99.99/year";

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css?family=Roboto:400,500,700",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Welcome to WordWeave! Your subscription is confirmed.</Preview>
      <Section style={main}>
        <Section style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🎉 Welcome to WordWeave!</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={paragraph}>Hi {name || "there"},</Text>

            <Text style={paragraph}>
              <strong>Congratulations!</strong> Your WordWeave subscription has
              been successfully activated. We&apos;re thrilled to have you as
              part of our community of writers who transform their content with
              AI.
            </Text>

            {/* Subscription Details */}
            <Section style={subscriptionBox}>
              <Heading style={h2}>Your Subscription Details</Heading>
              <Text style={subscriptionDetail}>
                <strong>Plan:</strong> WordWeave {planName} Plan
              </Text>
              <Text style={subscriptionDetail}>
                <strong>Price:</strong> {planPrice}
              </Text>
              {trialEndDate && (
                <Text style={subscriptionDetail}>
                  <strong>Trial Period:</strong> Free until{" "}
                  {new Date(trialEndDate).toLocaleDateString()}
                </Text>
              )}
            </Section>

            <Text style={paragraph}>
              <strong>What you can expect:</strong>
            </Text>

            <Text style={bulletPoint}>
              ✨ <strong>AI-Powered Writing Enhancement:</strong> Transform your
              content with advanced AI that understands context and tone
            </Text>
            <Text style={bulletPoint}>
              🚀 <strong>Instant Processing:</strong> Get professional-quality
              results in seconds, not hours
            </Text>
            <Text style={bulletPoint}>
              📝 <strong>Multiple Formats:</strong> Support for documents,
              emails, articles, and creative writing
            </Text>
            <Text style={bulletPoint}>
              🎯 <strong>Smart Suggestions:</strong> Contextual improvements
              that maintain your unique voice
            </Text>
            <Text style={bulletPoint}>
              💡 <strong>Creative Inspiration:</strong> Break through
              writer&apos;s block with AI-powered ideas
            </Text>

            <Text style={paragraph}>
              Ready to experience the magic? Your dashboard is waiting for you:
            </Text>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${process.env.NEXTAUTH_URL}/dashboard`}
              >
                Start Writing with AI →
              </Button>
            </Section>

            <Text style={paragraph}>
              <strong>Need help getting started?</strong> Check out our quick
              start guide or reach out to our support team. We&apos;re here to
              ensure you get the most out of WordWeave.
            </Text>

            <Text style={paragraph}>
              Thank you for choosing WordWeave. We can&apos;t wait to see the
              amazing content you&apos;ll create!
            </Text>

            <Text style={signature}>
              Best regards,
              <br />
              The WordWeave Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email or visit our help center.
            </Text>
            <Text style={footerText}>
              WordWeave - Transform Your Writing with AI
            </Text>
          </Section>
        </Section>
      </Section>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#f97316", // Orange-500
  borderRadius: "12px 12px 0 0",
  padding: "24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1f2937", // Gray-800
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const content = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb", // Gray-200
  borderRadius: "0 0 12px 12px",
  padding: "32px",
};

const paragraph = {
  color: "#374151", // Gray-700
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const subscriptionBox = {
  backgroundColor: "#fef3e2", // Orange-50
  border: "1px solid #fed7aa", // Orange-200
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const subscriptionDetail = {
  color: "#1f2937", // Gray-800
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const bulletPoint = {
  color: "#374151", // Gray-700
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f97316", // Orange-500
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  border: "none",
  cursor: "pointer",
};

const signature = {
  color: "#374151", // Gray-700
  fontSize: "16px",
  lineHeight: "24px",
  margin: "24px 0 0 0",
};

const footer = {
  borderTop: "1px solid #e5e7eb", // Gray-200
  padding: "20px 0",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280", // Gray-500
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};
