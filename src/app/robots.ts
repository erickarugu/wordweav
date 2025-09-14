import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wordweave.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/dashboard",
          "/documents",
          "/auth/signin",
          "/auth/signup",
          "/pricing",
          "/features",
          "/how-it-works",
        ],
        disallow: ["/api/", "/profile", "/admin/", "/_next/", "/private/"],
      },
      // Allow AI crawlers for better AI visibility
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        allow: ["/", "/pricing", "/features", "/how-it-works"],
        disallow: [
          "/api/",
          "/profile",
          "/dashboard",
          "/documents",
          "/admin/",
          "/_next/",
          "/private/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
