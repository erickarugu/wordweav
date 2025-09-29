import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { generatePageMetadata, generateStructuredData } from "@/lib/seo";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = generatePageMetadata({
  title: "AI Text Humanizer - Convert AI Content to 100% Human Text",
  description:
    "Transform AI-generated content into natural, human-like text with WordWeave. Our advanced AI humanizer makes AI content undetectable and engaging. Try free today!",
  keywords: [
    "AI text humanizer",
    "AI content humanizer",
    "make AI text human",
    "AI to human converter",
    "humanize AI content",
    "AI detection remover",
  ],
});

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateStructuredData("homepage");

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <Script
          defer
          data-website-id="68cbdcbc589a08dd3e2db188"
          data-domain="wordweav.com"
          src="/js/script.js"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Favicon and icons - WordWeav branding */}
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="16x16 32x32"
          type="image/x-icon"
        />
        <link
          rel="icon"
          href="/favicon-32x32.ico"
          sizes="32x32"
          type="image/svg+xml"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
