import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Text Humanization Blog - Tips, Guides & Best Practices",
  description:
    "Expert insights on AI text humanization, bypass AI detection, and convert AI content to human-like text. Learn best practices and advanced techniques.",
  keywords: [
    "AI text humanization blog",
    "AI detection bypass tips",
    "humanize AI content guide",
    "AI to human text conversion",
    "make AI text undetectable",
  ],
  path: "/blog",
});

const blogPosts = [
  {
    title: "Complete Guide to AI Text Humanization in 2025",
    excerpt:
      "Learn everything about transforming AI-generated content into natural, human-like text that passes detection tools.",
    slug: "complete-guide-ai-text-humanization-2025",
    category: "Guide",
    readTime: "8 min read",
    date: "March 15, 2025",
  },
  {
    title: "How to Bypass AI Detection Tools: 10 Proven Methods",
    excerpt:
      "Discover 10 effective techniques to make your AI content undetectable by popular AI detection tools.",
    slug: "bypass-ai-detection-tools-methods",
    category: "Tutorial",
    readTime: "6 min read",
    date: "March 12, 2025",
  },
  {
    title: "ChatGPT vs Human Writing: Key Differences and Solutions",
    excerpt:
      "Understanding the telltale signs of AI writing and how to transform them into human-like content.",
    slug: "chatgpt-vs-human-writing-differences",
    category: "Analysis",
    readTime: "5 min read",
    date: "March 10, 2025",
  },
  {
    title: "Best AI Humanizer Tools Compared: WordWeave vs Competitors",
    excerpt:
      "Comprehensive comparison of top AI humanization tools and why WordWeave leads the market.",
    slug: "best-ai-humanizer-tools-comparison",
    category: "Review",
    readTime: "10 min read",
    date: "March 8, 2025",
  },
  {
    title: "Academic Writing: How to Humanize AI Essays Effectively",
    excerpt:
      "Step-by-step guide for students and academics to transform AI essays into authentic, human-written content.",
    slug: "humanize-ai-essays-academic-writing",
    category: "Education",
    readTime: "7 min read",
    date: "March 5, 2025",
  },
  {
    title: "Content Marketing with AI: Humanization Best Practices",
    excerpt:
      "Leverage AI for content creation while maintaining authenticity through proper humanization techniques.",
    slug: "content-marketing-ai-humanization-practices",
    category: "Marketing",
    readTime: "9 min read",
    date: "March 3, 2025",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
            AI Humanization Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Expert insights, guides, and best practices for transforming
            AI-generated content into natural, human-like text that passes any
            detection tool.
          </p>
        </header>

        {/* Featured Post */}
        <section className="mb-16">
          <article className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 border border-orange-200">
            <div className="flex items-center mb-4">
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
              <span className="text-gray-500 ml-4">{blogPosts[0].date}</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="hover:text-orange-600 transition-colors"
              >
                {blogPosts[0].title}
              </Link>
            </h2>

            <p className="text-lg text-gray-600 mb-6">{blogPosts[0].excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded">
                  {blogPosts[0].category}
                </span>
                <span>{blogPosts[0].readTime}</span>
              </div>

              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Read More
              </Link>
            </div>
          </article>
        </section>

        {/* Blog Posts Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Latest Articles
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, index) => (
              <article
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-gray-600 mb-4">{post.excerpt}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Stay Updated on AI Humanization
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Get the latest tips, guides, and insights on AI text humanization
              delivered to your inbox. Learn how to make your AI content
              undetectable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
