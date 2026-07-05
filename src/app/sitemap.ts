import { MetadataRoute } from "next";

// Define blog posts with their publication dates for accurate lastModified
const blogPosts = [
  {
    slug: "complete-guide-ai-text-humanization-2025",
    publishedAt: "2025-09-15",
    priority: 0.9,
  },
  {
    slug: "bypass-ai-detection-tools-methods",
    publishedAt: "2025-09-12",
    priority: 0.9,
  },
  {
    slug: "best-ai-humanizer-tools-comparison",
    publishedAt: "2025-09-08",
    priority: 0.9,
  },
  {
    slug: "chatgpt-vs-human-writing-differences",
    publishedAt: "2025-09-10",
    priority: 0.9,
  },
  {
    slug: "humanize-ai-essays-academic-writing",
    publishedAt: "2025-08-25",
    priority: 0.9,
  },
  {
    slug: "content-marketing-ai-humanization-practices",
    publishedAt: "2025-08-22",
    priority: 0.9,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wordweav.com";
  const currentDate = new Date().toISOString();

  // Only public, indexable marketing pages belong here. Authenticated
  // pages (dashboard, documents, profile, subscription) are disallowed in
  // robots.ts and must not be listed in the sitemap.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: "2025-09-20",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Generate blog post URLs with accurate lastModified dates
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: post.priority,
  }));

  return [...staticPages, ...blogUrls];
}
