import TextProcessor from "@/components/TextProcessor";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
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

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Main Title with Gradient Animation */}
            <div className="mb-8 relative">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 relative">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent animate-gradient-x bg-300 font-extrabold tracking-tight">
                  WordWeave
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg blur opacity-20 animate-pulse"></div>
              </h1>

              {/* Magical Sparkles */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtitle with Typewriter Effect */}
            <div className="mb-12 max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl text-gray-700 font-light leading-relaxed">
                Transform your text into{" "}
                <span className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  compelling narratives
                </span>{" "}
                with the magic of AI-powered formatting
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mb-16 flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 ease-out">
                <span className="relative z-10">Start Creating Magic ✨</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-20 group-hover:opacity-40 blur transition-all duration-300"></div>
              </button>

              <button className="px-10 py-5 border-2 border-orange-300 text-orange-700 font-semibold text-xl rounded-full hover:bg-orange-50 transform hover:-translate-y-1 transition-all duration-300 ease-out hover:shadow-lg">
                Watch Demo
              </button>
            </div>

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

        {/* Text Processor Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Experience the Magic
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Watch your words transform before your eyes
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200/50 p-8">
              <TextProcessor />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
