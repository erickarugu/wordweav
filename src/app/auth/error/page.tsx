"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const errorMessages = {
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    message:
      "An account with this email already exists. Please sign in with your email and password first, then you can link your Google account from your profile settings.",
    action: "Sign in with Email",
    href: "/auth/signin",
  },
  OAuthCallback: {
    title: "Authentication Error",
    message:
      "There was an error during the authentication process. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    message: "There was an error creating your account. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    message:
      "There was an error creating your account with email. Please try again.",
    action: "Try Again",
    href: "/auth/signup",
  },
  Callback: {
    title: "Authentication Error",
    message:
      "There was an error during the authentication callback. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    message:
      "There was an error signing in with your OAuth provider. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
  EmailSignin: {
    title: "Email Sign In Error",
    message:
      "There was an error signing in with your email. Please check your credentials.",
    action: "Try Again",
    href: "/auth/signin",
  },
  CredentialsSignin: {
    title: "Invalid Credentials",
    message:
      "The email or password you entered is incorrect. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
  SessionRequired: {
    title: "Session Required",
    message: "You need to be signed in to access this page.",
    action: "Sign In",
    href: "/auth/signin",
  },
  default: {
    title: "Authentication Error",
    message:
      "An unexpected error occurred during authentication. Please try again.",
    action: "Try Again",
    href: "/auth/signin",
  },
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    setError(errorParam);
  }, [searchParams]);

  const errorInfo =
    error && errorMessages[error as keyof typeof errorMessages]
      ? errorMessages[error as keyof typeof errorMessages]
      : errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {errorInfo.message}
            </p>

            <div className="space-y-4">
              <Link
                href={errorInfo.href}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 block text-center"
              >
                {errorInfo.action}
              </Link>

              <Link
                href="/"
                className="w-full border border-orange-300 text-orange-700 py-3 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-200 block text-center"
              >
                Back to Home
              </Link>
            </div>

            {/* Additional help for OAuthAccountNotLinked */}
            {error === "OAuthAccountNotLinked" && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  How to link your Google account:
                </h3>
                <ol className="text-sm text-blue-800 text-left space-y-1">
                  <li>1. Sign in with your email and password</li>
                  <li>2. Go to your Profile settings</li>
                  <li>3. Click "Link Google Account"</li>
                  <li>4. Authorize the connection</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
