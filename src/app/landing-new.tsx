"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
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

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
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
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-4 pt-20">
            <div className="max-w-6xl mx-auto text-center">
              {/* Creative WordWeave Animation */}
              <div className="mb-8 relative">
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 relative overflow-hidden">
                  <div className="flex items-center justify-center">
                    {/* Word */}
                    <span className="relative">
                      {"Word".split("").map((letter, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-extrabold tracking-tight animate-bounce"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "2s",
                          }}
                        >
                          {letter}
                        </span>
                      ))}
                    </span>

                    {/* Weave with flowing animation */}
                    <span className="relative ml-2">
                      {"Weave".split("").map((letter, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent font-extrabold tracking-tight"
                          style={{
                            animation: `wave 3s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        >
                          {letter}
                        </span>
                      ))}
                    </span>
                  </div>

                  {/* Glowing background */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg blur opacity-20 animate-pulse"></div>
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
                    <div className="bg-white rounded-lg p-4 text-left">
                      <p className="text-gray-600 italic">
                        "Utilize our comprehensive solutions to optimize your
                        business processes and enhance operational efficiency
                        through strategic implementation of advanced
                        methodologies."
                      </p>
                    </div>
                  </div>

                  {/* Output */}
                  <div className="p-8 bg-green-50">
                    <h3 className="text-lg font-semibold text-green-700 mb-4">
                      Humanized Version
                    </h3>
                    <div className="bg-white rounded-lg p-4 text-left">
                      <p className="text-gray-600">
                        "Let us help you streamline your business and work
                        smarter, not harder. We'll show you proven strategies
                        that actually work in the real world."
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
