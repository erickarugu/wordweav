"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Toast, { useToast } from "@/components/Toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: string | null;
  plan: "monthly" | "yearly" | "individual" | "team";
  status: "active" | "canceled" | "cancelled" | "past_due" | "inactive";
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isOnTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  customerId?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "pending";
  date: string;
  description: string;
  invoiceUrl?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "subscription" | "billing"
  >("profile");

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [usageStats, setUsageStats] = useState({
    wordsUsedThisMonth: 0,
    wordsLimit: 15000,
    documentsProcessed: 0,
    lastUsed: null as string | null,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Load profile data
  useEffect(() => {
    if (session?.user?.email && !profile && !saving) {
      setLoading(true);
      loadProfileData().finally(() => setLoading(false));
    }
  }, [session?.user?.email, saving]); // Don't reload when saving

  const loadProfileData = async () => {
    try {
      // Load user profile
      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || "",
          email: profileData.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      // Load subscription data
      const subRes = await fetch("/api/user/subscription");
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
        setUsageStats(subData.usage);
      }

      // Load payment history
      const paymentsRes = await fetch("/api/user/payments");
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPaymentHistory(paymentsData.payments);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const refreshProfileOnly = async () => {
    try {
      const profileRes = await fetch("/api/user/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setProfileForm((prev) => ({
          ...prev,
          name: profileData.name || "",
          email: profileData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          currentPassword: profileForm.currentPassword || undefined,
          newPassword: profileForm.newPassword || undefined,
        }),
      });

      if (response.ok) {
        await refreshProfileOnly();
        setProfileForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        showToast("Profile updated successfully!", "success");

        // Update the session to reflect the new name in the navbar
        await update({
          name: profileForm.name,
        });
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast("An error occurred while updating your profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user/subscription/cancel", {
        method: "POST",
      });

      if (response.ok) {
        await loadProfileData();
        showToast(
          "Subscription canceled successfully. You'll retain access until the end of your current billing period.",
          "success"
        );
      } else {
        showToast(
          "Failed to cancel subscription. Please contact support.",
          "error"
        );
      }
    } catch (error) {
      showToast("An error occurred while canceling your subscription", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-orange-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account, subscription, and billing preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl border border-orange-200/50 shadow-sm">
          <div className="flex border-b border-orange-200/30">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-8 py-5 font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`px-8 py-5 font-medium transition-colors ${
                activeTab === "subscription"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Subscription
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`px-8 py-5 font-medium transition-colors ${
                activeTab === "billing"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              Billing
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl border-x border-b border-orange-200/50 p-10 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-12">
              {/* Profile Form */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Personal Information
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        title="Email cannot be changed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email address cannot be modified
                      </p>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-gray-200 pt-8 mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-6">
                      Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={profileForm.currentPassword}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={profileForm.newPassword}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={
                        saving ||
                        (!!profileForm.newPassword &&
                          profileForm.newPassword !==
                            profileForm.confirmPassword)
                      }
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Account Stats */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-6">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Member since:</span>
                    <span className="ml-2 font-medium">
                      {profile && formatDate(profile.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last updated:</span>
                    <span className="ml-2 font-medium">
                      {profile && formatDate(profile.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-10">
              {/* Current Plan */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Current Plan
                </h2>
                {subscription && subscription.status !== "inactive" ? (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {subscription.plan === "yearly"
                            ? "Individual Plan (Annual)"
                            : "Individual Plan (Monthly)"}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              subscription.status === "active"
                                ? "bg-green-100 text-green-800"
                                : subscription.isOnTrial
                                  ? "bg-orange-100 text-orange-800"
                                  : subscription.status === "cancelled" ||
                                      subscription.status === "canceled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subscription.isOnTrial
                              ? "On Trial"
                              : subscription.status === "active"
                                ? "Active"
                                : subscription.status.charAt(0).toUpperCase() +
                                  subscription.status
                                    .slice(1)
                                    .replace("_", " ")}
                          </span>
                        </div>
                        {subscription.isOnTrial &&
                          subscription.trialEndDate && (
                            <p className="text-sm text-orange-600 mt-2 font-medium">
                              Trial ends:{" "}
                              {formatDate(subscription.trialEndDate)}
                            </p>
                          )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          ${subscription.plan === "yearly" ? "99.99" : "9.99"}
                          <span className="text-sm text-gray-600">
                            /{subscription.plan === "yearly" ? "year" : "month"}
                          </span>
                        </div>
                        {subscription.isOnTrial && (
                          <p className="text-sm text-orange-600 font-medium">
                            7-day free trial
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current period:</span>
                        <span className="ml-2">
                          {subscription.currentPeriodStart
                            ? formatDate(subscription.currentPeriodStart)
                            : "N/A"}{" "}
                          -{" "}
                          {subscription.currentPeriodEnd
                            ? formatDate(subscription.currentPeriodEnd)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto-renewal:</span>
                        <span
                          className={`ml-2 ${
                            subscription.cancelAtPeriodEnd
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {subscription.cancelAtPeriodEnd
                            ? "Canceled"
                            : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => router.push("/#pricing")}
                        className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        Change Plan
                      </button>
                      {!subscription.cancelAtPeriodEnd && (
                        <button
                          onClick={handleCancelSubscription}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200 text-center">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Active Plan
                      </h3>
                      <p className="text-gray-600">
                        You don't have an active subscription. Choose a plan to
                        get started.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/#pricing")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                    >
                      Choose a Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Usage Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-6">
                  Usage This Month
                </h3>
                <div className="bg-white rounded-lg p-6 border border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {usageStats.wordsUsedThisMonth.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Words Used</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (usageStats.wordsUsedThisMonth /
                                usageStats.wordsLimit) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {usageStats.wordsLimit.toLocaleString()} limit
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {usageStats.documentsProcessed}
                      </div>
                      <div className="text-sm text-gray-600">
                        Documents Processed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {usageStats.lastUsed
                          ? new Date(usageStats.lastUsed).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Never"}
                      </div>
                      <div className="text-sm text-gray-600">Last Used</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Payment History
                </h2>
                {paymentHistory.length > 0 ? (
                  <div className="space-y-6">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white rounded-lg p-6 border border-orange-200 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-medium text-gray-800 mb-1">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(payment.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div
                            className={`text-sm ${
                              payment.status === "succeeded"
                                ? "text-green-600"
                                : payment.status === "failed"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </div>
                        </div>
                        {payment.invoiceUrl && (
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-6 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            View Invoice
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-lg mb-2">
                      No payment history available
                    </div>
                    <p className="text-sm">
                      Your payment history will appear here once you make your
                      first payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
