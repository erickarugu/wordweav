import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateStructuredData } from "@/lib/seo";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = generatePageMetadata({
  title: "Pricing - WordWeave AI Text Humanizer Plans & Cost",
  description:
    "Simple, transparent pricing for WordWeave's AI text humanizer. Start with a 7-day free trial, then $9.99/month or $99.99/year for 15,000 words of humanization monthly.",
  keywords: [
    "AI humanizer pricing",
    "AI text humanizer cost",
    "WordWeave pricing",
    "AI humanizer subscription",
    "cheap AI text humanizer",
  ],
  path: "/pricing",
});

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. Every new account gets a 7-day free trial with full access to the humanizer, up to 15,000 words. You can cancel anytime during the trial and you won't be charged.",
  },
  {
    q: "What happens after the trial ends?",
    a: "If you don't cancel, your card is charged for the plan you selected ($9.99/month or $99.99/year) and your 15,000-word monthly allowance renews each billing cycle.",
  },
  {
    q: "What happens if I go over my word limit?",
    a: "You'll be notified as you approach your monthly limit. You can wait for the next cycle to reset or upgrade if you consistently need more volume.",
  },
  {
    q: "Can I change plans or cancel anytime?",
    a: "Yes. You can switch between monthly and yearly billing, or cancel your subscription at any time from your account settings. Changes take effect immediately.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 30-day money-back guarantee if WordWeave isn't working out for you.",
  },
];

export default function PricingPage() {
  const structuredData = generateStructuredData("product");
  const faqStructuredData = generateStructuredData("faq");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              One plan, no confusing tiers. Start with a 7-day free trial of
              WordWeave&apos;s AI text humanizer, cancel anytime.
            </p>
          </header>

          <div className="max-w-md mx-auto mb-20">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    7-Day Free Trial
                  </div>
                </div>

                <div className="text-center mb-8 pt-4">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
                    <span className="text-orange-700 font-medium">
                      Individual Plan
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Perfect for Content Creators
                  </h2>
                  <p className="text-gray-600">
                    Everything you need to humanize AI-generated text
                  </p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-800">
                      $9.99
                    </span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    or $99.99/year (save 17%)
                  </p>
                </div>

                <ul className="space-y-4 mb-8 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    15,000 words per month
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    AI detection bypass
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Multiple writing styles
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Export in multiple formats
                  </li>
                </ul>

                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  Start 7-Day Free Trial
                </Link>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Cancel anytime during your trial • No charge until day 8
                </p>
              </div>
            </div>
          </div>

          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Pricing FAQ
            </h2>
            <div className="space-y-6">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200"
                >
                  <summary className="text-lg font-semibold text-gray-800 cursor-pointer">
                    {item.q}
                  </summary>
                  <p className="mt-4 text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="text-center mt-20">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 border border-orange-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Ready to Start Humanizing Your AI Text?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Try WordWeave free for 7 days. No commitment, cancel anytime.
              </p>
              <Link
                href="/auth/signup"
                className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start 7-Day Free Trial
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
