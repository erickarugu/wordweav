"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // Check for payment status in URL params
    const payment = searchParams.get("payment");
    if (payment) {
      setPaymentStatus(payment);
      // Clear the URL parameter after a delay
      setTimeout(() => {
        setPaymentStatus(null);
        router.replace("/", { scroll: false });
      }, 5000);
    }
  }, [searchParams, router]);

  const handleStartTrial = async () => {
    // Check if user is authenticated
    if (!session) {
      alert("Please sign in to start your free trial");
      window.location.href = "/auth/signin";
      return;
    }

    setCheckoutLoading(true);

    try {
      console.log("Starting checkout process for plan:", selectedPlan);

      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      console.log("Checkout response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Checkout data:", data);

        if (data.checkoutUrl) {
          console.log("Redirecting to:", data.checkoutUrl);
          window.location.href = data.checkoutUrl;
        } else {
          alert("No checkout URL received");
        }
      } else {
        const error = await response.json();
        console.error("Checkout error:", error);
        alert(`Error: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout process");
    } finally {
      setCheckoutLoading(false);
    }
  };
  const [userCount, setUserCount] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/user-count")
      .then((res) => res.json())
      .then((data) => setUserCount(data.count))
      .catch(() => setUserCount("100+"));
  }, []);

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-15px);
          }
          60% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-gentle {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-5px) translateX(2px);
          }
          50% {
            transform: translateY(-2px) translateX(-1px);
          }
          75% {
            transform: translateY(-8px) translateX(1px);
          }
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
        .bg-300 {
          background-size: 300% 300%;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div
            className="absolute top-32 right-10 w-96 h-96 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute -bottom-32 left-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Navigation */}
        <Navbar />

        <main className="relative z-10">
          {/* Payment Status Message */}
          {paymentStatus && (
            <div className="max-w-4xl mx-auto px-4 pt-24">
              <div
                className={`mb-8 p-4 rounded-lg border ${
                  paymentStatus === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center justify-center">
                  {paymentStatus === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {paymentStatus === "success" ? (
                    <div className="text-center">
                      <h3 className="font-semibold">Payment Successful! 🎉</h3>
                      <p className="text-sm mt-1">
                        Welcome to WordWeave! Your subscription is now active
                        and you should receive a confirmation email shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="font-semibold">Payment Cancelled</h3>
                      <p className="text-sm mt-1">
                        Your payment was cancelled. Feel free to try again when
                        you're ready!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-4 pt-20">
            <div className="max-w-6xl mx-auto text-center">
              {/* Creative WordWeave Animation */}
              <div className="mb-8 relative">
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 relative">
                  <div className="flex items-center justify-center">
                    {/* Word with sparkle effect */}
                    <span className="relative">
                      {"Word".split("").map((letter, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-extrabold tracking-tight transform hover:scale-110 transition-transform duration-300"
                          style={{
                            animation: `bounce 2s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        >
                          {letter}
                        </span>
                      ))}
                      {/* Floating sparkles around Word */}
                      <div className="absolute -top-4 -right-2 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                      <div
                        className="absolute -top-6 left-1/2 w-1 h-1 bg-amber-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </span>

                    {/* Weave with flowing animation and trails */}
                    <span className="relative ml-2">
                      {"Weave".split("").map((letter, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent font-extrabold tracking-tight relative"
                          style={{
                            animation: `wave 3s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        >
                          {letter}
                          {/* Letter trails */}
                          {i === 2 && (
                            <div
                              className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent opacity-30 animate-pulse"
                              style={{ animationDelay: "1s" }}
                            >
                              {letter}
                            </div>
                          )}
                        </span>
                      ))}
                      {/* Floating elements around Weave */}
                      <div
                        className="absolute -bottom-2 left-0 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div
                        className="absolute -top-3 right-1 w-1 h-1 bg-amber-400 rounded-full animate-ping"
                        style={{ animationDelay: "1.5s" }}
                      ></div>
                    </span>
                  </div>

                  {/* Subtle glow without box */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 blur-3xl animate-pulse"></div>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 left-1/4 w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"></div>
                  <div
                    className="absolute -bottom-8 right-1/4 w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </h1>

                {/* User Count Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-lg mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Trusted by {userCount} writers worldwide
                  </span>
                </div>
              </div>

              {/* New Subtitle - Humanizing Text */}
              <div className="mb-12 max-w-4xl mx-auto">
                <p className="text-2xl md:text-3xl text-gray-700 font-light leading-relaxed mb-6">
                  Transform{" "}
                  <span className="font-semibold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                    robotic AI text
                  </span>{" "}
                  into{" "}
                  <span className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    100% human-like content
                  </span>
                </p>

                {/* Before/After Example */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                  {/* Before - Robotic */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-red-700">
                        AI Generated
                      </span>
                    </div>
                    <p className="text-gray-600 text-left italic">
                      "The implementation of advanced technological solutions
                      facilitates optimal operational efficiency through
                      systematic process optimization methodologies."
                    </p>
                  </div>

                  {/* After - Human */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-700">
                        Humanized
                      </span>
                    </div>
                    <p className="text-gray-600 text-left">
                      "Smart tech tools help businesses run smoother and get
                      more done. It's like having a super-efficient assistant
                      that never sleeps!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/auth/signup"
                  className="group bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Start Humanizing Text</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </Link>

                <Link
                  href="/auth/signin"
                  className="group bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Already have an account?</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>No signup required to try</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>100% privacy guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span>Instant results</span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
                  Why Choose WordWeave?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the perfect blend of AI technology and human
                  creativity
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "🧠",
                    title: "AI-Powered Intelligence",
                    desc: "Advanced algorithms understand context and tone to create natural-sounding text.",
                  },
                  {
                    icon: "⚡",
                    title: "Lightning Fast",
                    desc: "Transform any text in seconds, not minutes. Perfect for busy professionals.",
                  },
                  {
                    icon: "🎯",
                    title: "100% Human-Like",
                    desc: "Bypass AI detection tools with content that reads naturally and authentically.",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200/50 hover:bg-white/80 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section
            id="pricing"
            className="py-20 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Start your 7-day free trial today. No credit card required
                  until trial ends.
                </p>
              </div>

              {/* Plan Selector */}
              <div className="flex justify-center mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-orange-200/50">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedPlan === "monthly"
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedPlan === "yearly"
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Yearly (Save 17%)
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                {/* Individual Plan */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 hover:bg-white/90 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
                    {/* Popular Badge */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        7-Day Free Trial
                      </div>
                    </div>

                    {/* Plan Header */}
                    <div className="text-center mb-8 pt-4">
                      <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
                        <span className="text-orange-700 font-medium">
                          Individual Plan
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Perfect for Content Creators
                      </h3>
                      <p className="text-gray-600">
                        Everything you need to transform your writing
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-5xl font-bold text-gray-800">
                          ${selectedPlan === "monthly" ? "9.99" : "99.99"}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{selectedPlan === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      {selectedPlan === "yearly" && (
                        <div className="flex items-center justify-center text-gray-600">
                          <span className="line-through text-gray-400 mr-2">
                            $119.88
                          </span>
                          <span className="font-semibold text-green-600">
                            $99.99/year
                          </span>
                          <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Save 17%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">
                          15,000 words per month
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">
                          AI detection bypass
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">
                          Multiple writing styles
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">Priority support</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700">
                          Export in multiple formats
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                      <button
                        onClick={handleStartTrial}
                        disabled={checkoutLoading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {checkoutLoading
                          ? "Loading..."
                          : session
                            ? "Start 7-Day Free Trial"
                            : "Sign In to Start Free Trial"}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        No credit card required • Cancel anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ or Additional Info */}
              <div className="text-center mt-16">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200/50 p-8 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Frequently Asked Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Can I change plans anytime?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Yes! You can upgrade, downgrade, or cancel your plan at
                        any time. Changes take effect immediately.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        What happens if I exceed my word limit?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        You can purchase additional words or upgrade to a higher
                        tier. We'll notify you when you're approaching your
                        limit.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Is there a free trial?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Yes! Start with a 7-day free trial. No credit card
                        required. You'll be billed automatically after the trial
                        period ends.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Do you offer refunds?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        We offer a 30-day money-back guarantee if you're not
                        completely satisfied with WordWeave.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Demo Section */}
          <section id="demo" className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                See WordWeave in Action
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Watch how we transform robotic AI text into engaging, human-like
                content
              </p>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Input */}
                  <div className="p-8 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">
                      Original AI Text
                    </h3>
                    <div className="bg-white rounded-lg p-6 text-left max-h-96 overflow-y-auto">
                      <p className="text-gray-600 italic text-sm leading-relaxed">
                        "In the contemporary business ecosystem, organizations
                        are increasingly leveraging sophisticated technological
                        infrastructures to optimize operational methodologies
                        and enhance comprehensive productivity metrics. The
                        implementation of advanced systematic approaches
                        facilitates the achievement of superior performance
                        indicators through strategic utilization of innovative
                        solutions.
                        <br />
                        <br />
                        Our enterprise-grade platform encompasses a multitude of
                        functionality paradigms designed to streamline complex
                        workflow orchestrations while simultaneously maximizing
                        efficiency coefficients across diverse operational
                        verticals. Through the deployment of cutting-edge
                        algorithmic frameworks, stakeholders can anticipate
                        substantial improvements in key performance indicators
                        and return on investment metrics.
                        <br />
                        <br />
                        The strategic implementation of our comprehensive
                        solution architecture enables organizations to
                        systematically address operational inefficiencies
                        through data-driven decision-making processes. By
                        leveraging advanced analytics capabilities and machine
                        learning algorithms, businesses can optimize resource
                        allocation mechanisms and enhance overall organizational
                        performance.
                        <br />
                        <br />
                        Furthermore, our platform facilitates seamless
                        integration with existing enterprise systems, thereby
                        ensuring minimal disruption to established operational
                        protocols while maximizing the potential for
                        transformative organizational outcomes. The scalable
                        infrastructure supports enterprise-level deployments
                        with robust security frameworks and compliance adherence
                        protocols.
                        <br />
                        <br />
                        Through comprehensive training programs and dedicated
                        support structures, organizations can ensure optimal
                        utilization of platform capabilities, resulting in
                        accelerated time-to-value realization and sustainable
                        competitive advantages in their respective market
                        segments."
                      </p>
                    </div>
                  </div>

                  {/* Output */}
                  <div className="p-8 bg-green-50">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">
                      Humanized Version
                    </h3>
                    <div className="bg-white rounded-lg p-6 text-left max-h-96 overflow-y-auto">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        "Let's be honest – running a business today feels like
                        juggling flaming torches while riding a unicycle. That's
                        where we come in. We've built something that actually
                        makes your work life easier, not more complicated.
                        <br />
                        <br />
                        Think of us as your business's best friend – the one who
                        always has great advice and actually knows what they're
                        talking about. Our platform takes all those tedious,
                        time-consuming tasks that make you want to pull your
                        hair out and handles them for you. No more drowning in
                        spreadsheets or staying up late trying to figure out why
                        your numbers don't add up.
                        <br />
                        <br />
                        What makes us different? We don't just throw fancy tech
                        at your problems and hope for the best. We actually
                        listen to what you need and build solutions that work in
                        the real world. Our tools learn from your business
                        patterns and get smarter over time, kind of like having
                        a super-intelligent assistant who never needs coffee
                        breaks.
                        <br />
                        <br />
                        The best part? Setting everything up won't turn your
                        office upside down. We know you've got a business to
                        run, so we make sure everything plays nice with what
                        you're already using. No drama, no headaches, just
                        results.
                        <br />
                        <br />
                        And when you need help? We're actually there for you.
                        Not some chatbot that gives you the runaround, but real
                        people who know their stuff and genuinely want to see
                        you succeed. Because when you win, we win – and that's
                        exactly how we like it."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  WordWeave
                </h3>
                <p className="text-gray-400 mt-2">
                  Transform AI text into human-like content
                </p>
              </div>

              <div className="border-t border-gray-800 pt-8">
                <p className="text-gray-400">
                  © {new Date().getFullYear()} WordWeave. All rights reserved. Making AI text more
                  human, one word at a time.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
