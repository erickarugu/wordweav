"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TextProcessor from "@/components/TextProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { formatProcessingTime, formatDocumentTitle } from "@/utils/helpers";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    documentsProcessed: 0,
    wordsEnhanced: 0,
    timeSaved: 0,
    avgQualityScore: 0,
    thisMonth: {
      documents: 0,
      words: 0,
      hours: 0,
      avgQualityScore: 0,
    },
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch documents and analytics
      const response = await fetch("/api/text/documents");
      if (response.ok) {
        const data = await response.json();

        // Calculate stats from the data
        const totalDocs = data.documents?.length || 0;
        const totalWords =
          data.documents?.reduce(
            (sum: number, doc: any) =>
              sum + (doc.analytics?.wordsProcessed || 0),
            0
          ) || 0;
        const totalTime =
          data.documents?.reduce(
            (sum: number, doc: any) => sum + (doc.analytics?.timeSaved || 0),
            0
          ) || 0;

        // Calculate this month's stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthDocs =
          data.documents?.filter((doc: any) => {
            const docDate = new Date(doc.createdAt);
            return (
              docDate.getMonth() === currentMonth &&
              docDate.getFullYear() === currentYear
            );
          }) || [];

        const thisMonthWords = thisMonthDocs.reduce(
          (sum: number, doc: any) => sum + (doc.analytics?.wordsProcessed || 0),
          0
        );
        const thisMonthTime = thisMonthDocs.reduce(
          (sum: number, doc: any) => sum + (doc.analytics?.timeSaved || 0),
          0
        );

        // Calculate average quality scores (using improvementScore as quality metric)
        const docsWithScores =
          data.documents?.filter(
            (doc: any) => doc.analytics?.improvementScore
          ) || [];
        const totalQualityScore = docsWithScores.reduce(
          (sum: number, doc: any) =>
            sum + (doc.analytics.improvementScore || 0),
          0
        );
        const avgQualityScore =
          docsWithScores.length > 0
            ? totalQualityScore / docsWithScores.length
            : 0;

        const thisMonthDocsWithScores =
          thisMonthDocs.filter((doc: any) => doc.analytics?.improvementScore) ||
          [];
        const thisMonthQualityScore = thisMonthDocsWithScores.reduce(
          (sum: number, doc: any) =>
            sum + (doc.analytics.improvementScore || 0),
          0
        );
        const thisMonthAvgQuality =
          thisMonthDocsWithScores.length > 0
            ? thisMonthQualityScore / thisMonthDocsWithScores.length
            : 0;

        setStats({
          documentsProcessed: totalDocs,
          wordsEnhanced: totalWords,
          timeSaved: totalTime, // Keep in minutes
          avgQualityScore: Math.round(avgQualityScore),
          thisMonth: {
            documents: thisMonthDocs.length,
            words: thisMonthWords,
            hours: Math.round(thisMonthTime / 60),
            avgQualityScore: Math.round(thisMonthAvgQuality),
          },
        });

        setRecentDocuments(data.documents?.slice(0, 2) || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-orange-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Navigation */}
      <Navbar />

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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Hello, {session.user?.name || "there"}! 👋
            </p>
            <p className="text-lg text-gray-600">
              Ready to transform your text into beautiful narratives?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Documents Processed
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {loading ? "..." : stats.documentsProcessed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats.thisMonth.documents} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Words Enhanced
                    </p>
                    <p className="text-3xl font-bold text-amber-600">
                      {loading ? "..." : stats.wordsEnhanced.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats.thisMonth.words.toLocaleString()} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Time Saved
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {loading
                        ? "..."
                        : stats.timeSaved >= 60
                        ? `${Math.round(stats.timeSaved / 60)}h`
                        : `${stats.timeSaved}m`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +
                      {stats.thisMonth.hours > 0
                        ? `${stats.thisMonth.hours}h`
                        : "0h"}{" "}
                      this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Quality Score
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {loading ? "..." : `${stats.avgQualityScore}%`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.thisMonth.avgQualityScore > 0
                        ? `${stats.thisMonth.avgQualityScore}% this month`
                        : "No data this month"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Text Processor */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50 mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Text Processor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextProcessor onProcessComplete={fetchDashboardData} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading recent activity...</p>
                </div>
              ) : recentDocuments.length > 0 ? (
                <div className="space-y-4">
                  {recentDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/document/${doc.id}`)}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-700 transition-colors">
                          {formatDocumentTitle(doc.title)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {doc.analytics?.wordsProcessed || 0} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {doc.analytics?.timeSaved || 0} min saved
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {doc.analytics?.improvementScore?.toFixed(1) || 0}%
                            improvement
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Processed on{" "}
                          {new Date(doc.createdAt).toLocaleDateString()} with{" "}
                          {doc.mechanisms?.join(", ") || "basic processing"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                          {doc.mechanisms?.map((mechanism: string) => (
                            <span
                              key={mechanism}
                              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                            >
                              {mechanism}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          Quality:{" "}
                          {doc.analytics?.readabilityScore?.toFixed(1) || 0}/100
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Show More Button */}
                  <div className="mt-6 text-center">
                    <Button
                      onClick={() => router.push("/documents")}
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      View All Documents
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    No documents processed yet
                  </p>
                  <p className="text-sm text-gray-400">
                    Start by processing your first document above to see
                    analytics and history!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
