// SEO Configuration for WordWeave - AI Text Humanizer
export const SEO_CONFIG = {
  siteName: "WordWeave",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://wordweav.com",
  defaultTitle:
    "WordWeave - AI Text Humanizer | Convert AI Content to 100% Human Text",
  titleTemplate: "%s | WordWeave - AI Text Humanizer",
  defaultDescription:
    "Transform AI-generated content into natural, human-like text with WordWeave. Our advanced AI humanizer makes AI content undetectable and engaging. Try free today!",

  // High-value keywords for AI text humanization
  keywords: [
    "AI text humanizer",
    "AI content humanizer",
    "make AI text human",
    "AI to human converter",
    "humanize AI content",
    "AI detection remover",
    "convert AI text to human",
    "AI text converter",
    "humanize AI writing",
    "AI content rewriter",
    "make AI undetectable",
    "AI content humanization tool",
    "AI writing humanizer",
    "text humanization software",
    "AI detection bypass",
  ],

  // Schema.org structured data
  organization: {
    "@type": "Organization",
    name: "WordWeave",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://wordweav.com",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://wordweav.com"}/logo.png`,
    description:
      "Advanced AI text humanizer that converts AI-generated content into natural, human-like text",
    foundingDate: "2025",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@wordweav.com",
    },
    sameAs: [
      "https://twitter.com/wordweaveai",
      "https://linkedin.com/company/wordweave",
    ],
  },

  // Product schema for the AI humanizer service
  product: {
    "@type": "SoftwareApplication",
    name: "WordWeave AI Text Humanizer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description:
      "Advanced AI text humanization tool that converts AI-generated content into natural, human-like text",
    offers: {
      "@type": "Offer",
      price: "9.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150+",
    },
  },

  // FAQ Schema for common questions
  faq: [
    {
      question: "What is an AI text humanizer?",
      answer:
        "An AI text humanizer is a tool that transforms AI-generated content into natural, human-like text by improving flow, tone, and readability while maintaining the original meaning.",
    },
    {
      question: "How does WordWeave make AI text human?",
      answer:
        "WordWeave uses advanced natural language processing to analyze AI-generated text and rewrite it with human-like patterns, emotions, and conversational flow.",
    },
    {
      question: "Can WordWeave bypass AI detection?",
      answer:
        "Yes, our humanization process makes AI content appear more natural and human-written, helping it pass various AI detection tools.",
    },
    {
      question: "Is WordWeave free to use?",
      answer:
        "WordWeave offers a 7-day free trial with up to 15,000 words per month. Premium plans start at $9.99/month.",
    },
  ],
};

// Generate page metadata
export function generatePageMetadata({
  title,
  description,
  keywords,
  path = "",
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
}) {
  // Every call site already supplies a full, brand-inclusive title, so use
  // it as-is instead of appending the brand template a second time.
  const fullTitle = title || SEO_CONFIG.defaultTitle;

  const fullDescription = description || SEO_CONFIG.defaultDescription;
  const fullUrl = `${SEO_CONFIG.siteUrl}${path}`;
  const ogImage = image || `${SEO_CONFIG.siteUrl}/og-image.png`;

  const allKeywords = [...SEO_CONFIG.keywords, ...(keywords || [])].join(", ");

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    robots: noIndex ? "noindex,nofollow" : "index,follow",
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
      creator: "@wordweaveai",
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      "application-name": SEO_CONFIG.siteName,
      "apple-mobile-web-app-title": SEO_CONFIG.siteName,
      "theme-color": "#f97316", // Orange theme color
    },
  };
}

// Generate JSON-LD structured data
export function generateStructuredData(
  type: "homepage" | "product" | "faq" | "article",
  data?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    updatedAt?: string;
    image?: string;
    url?: string;
  }
) {
  const baseData = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case "homepage":
      return {
        ...baseData,
        "@type": "WebSite",
        name: SEO_CONFIG.siteName,
        url: SEO_CONFIG.siteUrl,
        description: SEO_CONFIG.defaultDescription,
        publisher: SEO_CONFIG.organization,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      };

    case "product":
      return {
        ...baseData,
        ...SEO_CONFIG.product,
      };

    case "faq":
      return {
        ...baseData,
        "@type": "FAQPage",
        mainEntity: SEO_CONFIG.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };

    case "article":
      return {
        ...baseData,
        "@type": "Article",
        headline: data?.title,
        description: data?.description,
        author: SEO_CONFIG.organization,
        publisher: SEO_CONFIG.organization,
        datePublished: data?.publishedAt,
        dateModified: data?.updatedAt || data?.publishedAt,
        image: data?.image,
        url: data?.url,
      };

    default:
      return baseData;
  }
}

// SEO utility functions
export const seoUtils = {
  // Generate SEO-friendly URL slugs
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  // Optimize text length for meta descriptions
  truncateDescription: (text: string, maxLength = 160): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3).trim() + "...";
  },

  // Generate breadcrumb schema
  generateBreadcrumbs: (items: Array<{ name: string; url: string }>) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  },
};
