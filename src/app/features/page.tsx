import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateStructuredData } from "@/lib/seo";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = generatePageMetadata({
  title: "Features - WordWeave AI Text Humanizer",
  description:
    "Explore WordWeave's AI humanizer features: AI detection bypass, multiple writing styles, meaning preservation, fast processing, and document export.",
  keywords: [
    "AI humanizer features",
    "AI text humanizer tool",
    "AI detection bypass features",
    "AI writing style converter",
  ],
  path: "/features",
});

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Humanization",
    desc: "Advanced language models analyze over 50 AI writing markers — sentence rhythm, word choice, repetition patterns — and rewrite them with natural, human-like phrasing.",
  },
  {
    icon: "🎯",
    title: "AI Detection Bypass",
    desc: "Humanized output is built to read naturally to detectors like GPTZero, Turnitin, and Originality.ai by removing the structural signatures those tools look for.",
  },
  {
    icon: "📝",
    title: "Meaning Preservation",
    desc: "Your original facts, arguments, and intent stay intact. WordWeave changes how the text sounds, not what it says.",
  },
  {
    icon: "🎨",
    title: "Multiple Writing Styles",
    desc: "Adjust tone and register for academic essays, marketing copy, casual blog posts, or professional business writing.",
  },
  {
    icon: "⚡",
    title: "Fast Processing",
    desc: "Most documents are humanized in 10-30 seconds, so you can iterate quickly instead of waiting around.",
  },
  {
    icon: "📤",
    title: "Export & Save",
    desc: "Save documents to your account and export your humanized text in multiple formats when you're ready to use it.",
  },
];

export default function FeaturesPage() {
  const structuredData = generateStructuredData("product");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Everything WordWeave Does for Your Writing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A closer look at how our AI text humanizer turns robotic
              AI-generated content into natural, human-sounding writing.
            </p>
          </header>

          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200/50 hover:bg-white/80 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Who Uses WordWeave
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Students
                  </h3>
                  <p className="text-gray-600">
                    Turn AI-assisted research and drafts into essays that read
                    in your own voice before submitting coursework.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Content Marketers
                  </h3>
                  <p className="text-gray-600">
                    Scale content production with AI, then humanize it so blog
                    posts and copy sound authentic to readers.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Professionals
                  </h3>
                  <p className="text-gray-600">
                    Polish AI-drafted emails, reports, and proposals into
                    natural, engaging business writing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Try Every Feature Free for 7 Days
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Full access to the humanizer, all writing styles, and export
                options — no credit card surprises.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start 7-Day Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-50 transform hover:scale-105 transition-all duration-300"
                >
                  See Pricing
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
