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
  Row,
  Column,
  Img,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name = "Writer" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={logo}>
                  <span style={logoIcon}>✨</span>
                  WordWeave
                </Heading>
                <Text style={tagline}>Transform Your Writing with AI</Text>
              </Column>
            </Row>
          </Section>

          {/* Welcome Message */}
          <Section style={content}>
            <Heading style={title}>Welcome to WordWeave, {name}! 🧡✨</Heading>

            <Text style={paragraph}>
              We're absolutely thrilled to have you join our vibrant community
              of writers who are revolutionizing the way they craft compelling
              content! Your journey to effortless, polished writing starts now
              with the warmth of our AI-powered tools.
            </Text>

            <Text style={paragraph}>
              WordWeave harnesses the power of advanced AI to help you:
            </Text>

            {/* Features Grid */}
            <Section style={featuresContainer}>
              <Row>
                <Column style={featureColumn}>
                  <div style={featureCard}>
                    <div style={featureIcon}>🎨</div>
                    <Text style={featureTitle}>Naturalize Your Text</Text>
                    <Text style={featureDescription}>
                      Transform robotic writing into natural, flowing prose
                    </Text>
                  </div>
                </Column>
                <Column style={featureColumn}>
                  <div style={featureCard}>
                    <div style={featureIcon}>💎</div>
                    <Text style={featureTitle}>Enhance Clarity</Text>
                    <Text style={featureDescription}>
                      Make complex ideas crystal clear and easy to understand
                    </Text>
                  </div>
                </Column>
              </Row>
              <Row>
                <Column style={featureColumn}>
                  <div style={featureCard}>
                    <div style={featureIcon}>🎭</div>
                    <Text style={featureTitle}>Perfect Your Tone</Text>
                    <Text style={featureDescription}>
                      Match your writing style to any audience or purpose
                    </Text>
                  </div>
                </Column>
                <Column style={featureColumn}>
                  <div style={featureCard}>
                    <div style={featureIcon}>🏗️</div>
                    <Text style={featureTitle}>Improve Structure</Text>
                    <Text style={featureDescription}>
                      Organize your thoughts with logical flow and coherence
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://wordweave.app/dashboard">
                Start Writing Better Today →
              </Button>
            </Section>

            <Text style={paragraph}>
              Ready to see the magic in action? 🪄 Jump into your dashboard and
              experience how WordWeave can transform your writing in seconds.
              Whether you're crafting emails, reports, or creative content,
              we've got you covered with warmth and precision.
            </Text>

            {/* Stats Section */}
            <Section style={statsContainer}>
              <Text style={statsTitle}>
                Join thousands of writers who are already glowing with success:
              </Text>
              <Row>
                <Column style={statColumn}>
                  <Text style={statNumber}>10x</Text>
                  <Text style={statLabel}>Faster Writing</Text>
                </Column>
                <Column style={statColumn}>
                  <Text style={statNumber}>85%</Text>
                  <Text style={statLabel}>Time Saved</Text>
                </Column>
                <Column style={statColumn}>
                  <Text style={statNumber}>100%</Text>
                  <Text style={statLabel}>Better Quality</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footerText}>
              Need help getting started? Just reply to this email - we're here
              to help with a smile! 😊 You can also check out our{" "}
              <Link href="https://wordweave.app/help" style={link}>
                quick start guide
              </Link>{" "}
              for tips and tricks.
            </Text>

            <Text style={footerText}>
              Happy writing with warmth! 🧡
              <br />
              <strong>The WordWeave Team</strong> ✨
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerSmall}>
              © 2025 WordWeave. All rights reserved.
              <br />
              You're receiving this because you signed up for WordWeave.
            </Text>
            <Text style={footerSmall}>
              <Link href="https://wordweave.app/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>{" "}
              |{" "}
              <Link href="https://wordweave.app/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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

const featuresContainer = {
  margin: "32px 0",
};

const featureColumn = {
  width: "50%",
  padding: "0 8px",
};

const featureCard = {
  backgroundColor: "#fef3c7",
  borderRadius: "12px",
  padding: "20px",
  margin: "8px 0",
  textAlign: "center" as const,
  border: "1px solid #fde68a",
};

const featureIcon = {
  fontSize: "32px",
  marginBottom: "12px",
};

const featureTitle = {
  color: "#9a3412",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const featureDescription = {
  color: "#a16207",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)",
};

const statsContainer = {
  backgroundColor: "#fef3c7",
  borderRadius: "12px",
  padding: "24px",
  margin: "32px 0",
  textAlign: "center" as const,
  border: "1px solid #fde68a",
};

const statsTitle = {
  color: "#9a3412",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const statColumn = {
  width: "33.33%",
  textAlign: "center" as const,
};

const statNumber = {
  color: "#ea580c",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "1.2",
};

const statLabel = {
  color: "#a16207",
  fontSize: "14px",
  margin: "4px 0 0 0",
};

const hr = {
  borderColor: "#fde68a",
  margin: "32px 0",
};

const footerText = {
  color: "#a16207",
  fontSize: "16px",
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
};

const footerLink = {
  color: "#a16207",
  textDecoration: "none",
};
