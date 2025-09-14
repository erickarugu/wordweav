"use client";

import { useState } from "react";
import Toast from "./Toast";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setToastMessage("Please enter a valid email address");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail("");
        setToastMessage("Successfully subscribed to our newsletter!");
        setToastType("success");
      } else {
        setToastMessage(data.error || "Failed to subscribe. Please try again.");
        setToastType("error");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setToastMessage("Something went wrong. Please try again.");
      setToastType("error");
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  return (
    <>
      <section className="mt-20">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200 text-center">
          <div className="mb-4">
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Join 1000+ subscribers
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Stay Updated on AI Humanization
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest tips, guides, and insights on AI text humanization
            delivered to your inbox. Learn how to make your AI content
            undetectable and improve your writing quality.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
