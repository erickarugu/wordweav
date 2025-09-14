"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="relative z-50 p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
        >
          WordWeave
        </Link>

        <div className="flex gap-4 items-center">
          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : session ? (
            // Authenticated user menu
            <div className="flex items-center gap-4">
              {!isDashboard && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-orange-700 font-medium hover:text-orange-800 transition-colors"
                >
                  Dashboard
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">
                      {session.user?.name?.charAt(0) ||
                        session.user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <span className="hidden sm:inline">
                    {session.user?.name || "User"}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-orange-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-orange-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                    {!isDashboard && (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile & Billing
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Unauthenticated user buttons
            <>
              <Link
                href="/auth/signin"
                className="px-6 py-2 text-orange-700 font-medium hover:text-orange-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
}
