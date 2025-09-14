import { Metadata } from "next";
import { generatePageMetadata, generateStructuredData } from "@/lib/seo";
import Landing from "./landing";

export const metadata: Metadata = generatePageMetadata({
  title: "WordWeave - #1 AI Text Humanizer | Make AI Content 100% Human",
  description:
    "Transform AI-generated content into natural, human-like text that passes AI detection. WordWeave's advanced humanizer makes your AI content engaging and undetectable. Start free!",
  keywords: [
    "AI text humanizer",
    "AI content humanizer",
    "make AI text human",
    "AI to human converter",
    "humanize AI content",
    "AI detection remover",
    "convert AI text to human",
    "AI writing humanizer",
    "bypass AI detection",
    "make AI undetectable",
  ],
});

export default function Home() {
  return (
    <>
      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData("product")),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData("faq")),
        }}
      />
      <Landing />
    </>
  );
}
