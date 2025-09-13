import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  name: string;
  resetLink: string;
}

export default function ResetPasswordEmail({
  name = "User",
  resetLink = "#",
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              <span style={logoIcon}>✨</span>
              WordWeave
            </Heading>
            <Text style={tagline}>Transform Your Writing with AI</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>🔐 Reset Your Password</Heading>

            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              We received a request to reset your password for your WordWeave
              account. Click the button below to create a new password:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset My Password
              </Button>
            </Section>

            <Text style={paragraph}>
              This link will expire in 24 hours for security reasons. If you
              didn't request a password reset, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={footerText}>
              If the button doesn't work, copy and paste this link into your
              browser:
              <br />
              <Link href={resetLink} style={link}>
                {resetLink}
              </Link>
            </Text>

            <Text style={footerText}>
              Need help? Just reply to this email - we're here to help!
              <br />
              <strong>The WordWeave Team</strong> ✨
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerSmall}>
              © 2025 WordWeave. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Shared styles (matching WelcomeEmail theme)
const main = {
  backgroundColor: "#fef3c7",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginTop: "30px",
  marginBottom: "30px",
  width: "600px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const header = {
  background: "linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)",
  padding: "40px 40px 30px 40px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "center" as const,
};

const logoIcon = {
  fontSize: "40px",
  marginRight: "8px",
};

const tagline = {
  color: "#fed7aa",
  fontSize: "16px",
  margin: "8px 0 0 0",
  textAlign: "center" as const,
};

const content = {
  padding: "40px",
};

const title = {
  color: "#9a3412",
  fontSize: "28px",
  fontWeight: "bold",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#78350f",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
};

const hr = {
  borderColor: "#fde68a",
  margin: "32px 0",
};

const footerText = {
  color: "#a16207",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "16px 0",
  textAlign: "center" as const,
};

const footer = {
  backgroundColor: "#fef3c7",
  padding: "20px 40px",
  textAlign: "center" as const,
};

const footerSmall = {
  color: "#a16207",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "8px 0",
};

const link = {
  color: "#ea580c",
  textDecoration: "none",
  wordBreak: "break-all" as const,
};
