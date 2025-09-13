'use client';

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [userCount, setUserCount] = useState<string>("Loading...");

  useEffect(() => {
    fetch('/api/user-count')
      .then(res => res.json())
      .then(data => setUserCount(data.count))
      .catch(() => setUserCount("100+"));
  }, []);

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .bg-300 { background-size: 300% 300%; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-32 right-10 w-96 h-96 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed"></div>
        <div className="absolute -bottom-32 left-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-orange-400 rounded-full opacity-30 animate-float-particle-${
              i % 3
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
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
                          animationDuration: '2s'
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
                          animationDelay: `${i * 0.2}s`
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
                    <span className="text-sm font-medium text-red-700">AI Generated</span>
                  </div>
                  <p className="text-gray-600 text-left italic">
                    "The implementation of advanced technological solutions facilitates optimal operational efficiency 
                    through systematic process optimization methodologies."
                  </p>
                </div>
                
                {/* After - Human */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-700">Humanized</span>
                  </div>
                  <p className="text-gray-600 text-left">
                    "Smart tech tools help businesses run smoother and get more done. 
                    It's like having a super-efficient assistant that never sleeps!"
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
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              
              <Link
                href="/auth/signin"
                className="group bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Already have an account?</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
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

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: "✨",
                  title: "AI-Powered",
                  desc: "Intelligent text enhancement",
                },
                {
                  icon: "⚡",
                  title: "Lightning Fast",
                  desc: "Process text in seconds",
                },
                {
                  icon: "🎨",
                  title: "Beautiful Output",
                  desc: "Professional formatting",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200/50 hover:bg-white/80 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-20 px-4 bg-white/30 backdrop-blur-sm"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
                Simple Pricing
              </h2>
              <p className="text-xl text-gray-600">
                Choose the plan that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Monthly Plan */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 hover:shadow-xl transition-all duration-300 relative">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Monthly Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-orange-600">
                    $9.99
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Unlimited text processing
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    All formatting options
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Export to multiple formats
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/auth/signup?plan=monthly"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
              </div>

              {/* Yearly Plan */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-orange-400 hover:shadow-xl transition-all duration-300 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Yearly Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-orange-600">
                    $100
                  </span>
                  <span className="text-gray-600">/year</span>
                  <div className="text-sm text-green-600 font-medium">
                    Save $19.88!
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Everything in Monthly
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    Team collaboration
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span>
                    API access
                  </li>
                </ul>
                <Link
                  href="/auth/signup?plan=yearly"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Experience the magic of WordWeave. Sign up to unlock the full
                power of AI-enhanced text processing.
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Free Trial ✨
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200/50 p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-3xl blur-xl"></div>
              <div className="relative">
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">🔒</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Premium Feature
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sign up to access our powerful text processing tools and
                    start transforming your content today.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                  >
                    Unlock Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  WordWeave
                </h3>
                <p className="text-gray-400">
                  Transform your writing with AI-powered text enhancement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#pricing"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#demo"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Demo
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 WordWeave. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </>
  );
}
