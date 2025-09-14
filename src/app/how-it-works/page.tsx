import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateStructuredData } from "@/lib/seo";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = generatePageMetadata({
  title: "How Our AI Text Humanizer Works - Transform AI Content to Human",
  description:
    "Learn how WordWeave's advanced AI humanization technology converts robotic AI text into natural, human-like content that passes AI detection. Step-by-step process explained.",
  keywords: [
    "how AI text humanizer works",
    "AI to human text conversion process",
    "AI content humanization technology",
    "make AI text human process",
    "AI detection bypass method",
  ],
  path: "/how-it-works",
});

export default function HowItWorks() {
  const faqStructuredData = generateStructuredData("faq");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          {/* Hero Section */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              How Our AI Text Humanizer Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the advanced technology behind WordWeave that transforms
              robotic AI-generated content into natural, human-like text that
              passes any AI detection tool.
            </p>
          </header>

          {/* Process Steps */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              4-Step AI Humanization Process
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <article className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  AI Content Analysis
                </h3>
                <p className="text-gray-600">
                  Our system analyzes your AI-generated text to identify robotic
                  patterns, repetitive structures, and unnatural language flows.
                </p>
              </article>

              {/* Step 2 */}
              <article className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Human Pattern Matching
                </h3>
                <p className="text-gray-600">
                  Advanced NLP algorithms apply human writing patterns,
                  emotional nuances, and conversational flow to replace robotic
                  elements.
                </p>
              </article>

              {/* Step 3 */}
              <article className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Context Preservation
                </h3>
                <p className="text-gray-600">
                  The original meaning and context are carefully preserved while
                  enhancing readability and natural language flow.
                </p>
              </article>

              {/* Step 4 */}
              <article className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Quality Assurance
                </h3>
                <p className="text-gray-600">
                  Final quality checks ensure the humanized text passes AI
                  detection while maintaining professional quality and accuracy.
                </p>
              </article>
            </div>
          </section>

          {/* Technology Behind */}
          <section className="mb-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Advanced AI Humanization Technology
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Natural Language Processing (NLP)
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our sophisticated NLP models understand context, tone, and
                    human writing patterns to transform AI text into naturally
                    flowing content.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Machine Learning Algorithms
                  </h3>
                  <p className="text-gray-600">
                    Continuously trained on millions of human-written texts to
                    identify and replicate authentic human writing styles and
                    patterns.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    AI Detection Bypass
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Specifically designed to outsmart AI detection tools by
                    removing telltale signs of artificial content generation.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Semantic Understanding
                  </h3>
                  <p className="text-gray-600">
                    Deep semantic analysis ensures meaning preservation while
                    transforming structure and style for maximum human-like
                    appeal.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="max-w-4xl mx-auto space-y-6">
              <details className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                  How accurate is the AI humanization process?
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>
                    Our AI humanizer achieves 95%+ accuracy in making AI content
                    appear human-written. The process maintains original meaning
                    while completely transforming the writing style and
                    structure.
                  </p>
                </div>
              </details>

              <details className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                  Will humanized text pass AI detection tools?
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>
                    Yes, our humanization technology is specifically designed to
                    bypass popular AI detection tools including GPTZero,
                    Turnitin, and Originality.ai by removing AI signatures and
                    adding human writing patterns.
                  </p>
                </div>
              </details>

              <details className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                  How long does the humanization process take?
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>
                    Most text is humanized within 10-30 seconds, depending on
                    length and complexity. Our advanced algorithms work quickly
                    while maintaining high quality output.
                  </p>
                </div>
              </details>

              <details className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
                <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                  What types of AI content can be humanized?
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>
                    Our humanizer works with all types of AI-generated content
                    including articles, essays, emails, social media posts,
                    product descriptions, and academic papers from any AI tool
                    like ChatGPT, Claude, or Jasper.
                  </p>
                </div>
              </details>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Humanize Your AI Text?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience the power of our AI humanization technology.
                Transform your robotic AI content into engaging, human-like text
                in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Humanizing Text Free
                </Link>

                <Link
                  href="/"
                  className="bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-50 transform hover:scale-105 transition-all duration-300"
                >
                  Start 7-Day Free Trial
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
