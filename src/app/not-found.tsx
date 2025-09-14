import Link from "next/link";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Page Not Found - 404 Error",
  description:
    "The page you're looking for doesn't exist. Return to WordWeave AI Text Humanizer to transform your AI content into human-like text.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. Let's get you back
            on track to humanizing your AI content.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Return to AI Text Humanizer
          </Link>

          <div className="text-gray-500">
            <p>or try these popular pages:</p>
            <div className="mt-4 space-x-4">
              <Link
                href="/dashboard"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/signin"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
