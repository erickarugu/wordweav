import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wordweav.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/how-it-works",
          "/pricing",
          "/features",
          "/blog",
          "/blog/*",
        ],
        disallow: [
          "/api/",
          "/profile",
          "/dashboard",
          "/documents",
          "/subscription",
          "/admin/",
          "/_next/",
          "/private/",
          "/auth/",
        ],
      },
      // Allow AI crawlers for better AI visibility but restrict protected areas
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Googlebot",
          "Bingbot",
        ],
        allow: [
          "/",
          "/pricing",
          "/features",
          "/how-it-works",
          "/blog",
          "/blog/*",
        ],
        disallow: [
          "/api/",
          "/profile",
          "/dashboard",
          "/documents",
          "/subscription",
          "/admin/",
          "/_next/",
          "/private/",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
