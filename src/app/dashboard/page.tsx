'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextProcessor from '@/components/TextProcessor';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Check authentication with Supabase
    // For now, simulate a logged-in user
    setTimeout(() => {
      setUser({ 
        email: 'user@example.com', 
        name: 'John Doe',
        plan: 'monthly' 
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSignOut = () => {
    // TODO: Implement Supabase sign out
    setUser(null);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-orange-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              WordWeave
            </Link>
            
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-gray-800">{user.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                  {user.plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                </span>
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-10 w-96 h-96 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed"></div>
          <div className="absolute -bottom-32 left-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-4">
              Your Writing Studio
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Transform your text with the magic of AI-powered formatting and enhancement
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "📝", title: "Texts Processed", value: "147", desc: "This month" },
              { icon: "⚡", title: "Time Saved", value: "12.5h", desc: "This month" },
              { icon: "✨", title: "Words Enhanced", value: "45.2k", desc: "Total" }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 hover:bg-white/80 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700">{stat.title}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* Text Processor */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200/50 p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-3xl blur-xl"></div>
            <div className="relative">
              <TextProcessor />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: "2 hours ago", action: "Processed marketing copy", type: "Business" },
                { time: "Yesterday", action: "Enhanced blog article", type: "Creative" },
                { time: "2 days ago", action: "Formatted product description", type: "Ecommerce" }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-orange-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-800">{activity.action}</div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
