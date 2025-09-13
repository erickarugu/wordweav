"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Download,
  BarChart3,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Target,
  Zap,
} from "lucide-react";
import Toast, { useToast } from "@/components/Toast";
import {
  formatProcessingTime,
  formatDocumentTitle,
  createFilename,
} from "@/utils/helpers";

interface DocumentData {
  id: string;
  title: string;
  originalText: string;
  processedText: string;
  wordCount: number;
  processingTime: number;
  mechanisms: string[];
  createdAt: string;
  analytics: {
    readabilityScore: number;
    sentimentScore: number;
    complexityScore: number;
    improvementScore: number;
    keywordDensity: Record<string, number>;
    grammarIssues: number;
    styleImprovements: number;
    wordsProcessed: number;
    timeSaved: number;
  } | null;
}

// Helper function to render markup text
function renderMarkupText(text: string) {
  // Convert markdown-style formatting to HTML
  let formattedText = text
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    )
    // Line breaks
    .replace(/\n/g, "<br />");

  return formattedText;
}

// Helper function to strip markup for copying
function stripMarkup(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .trim();
}

export default function DocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (params.id) {
      fetchDocument();
    }
  }, [params.id, status]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/text/documents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else if (response.status === 404) {
        setError("Document not found");
      } else {
        setError("Failed to load document");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (
    text: string,
    type: "original" | "processed"
  ) => {
    try {
      const cleanText = stripMarkup(text);
      await navigator.clipboard.writeText(cleanText);
      showToast(
        `${
          type === "original" ? "Original" : "Processed"
        } text copied to clipboard!`,
        "success"
      );
    } catch (error) {
      showToast("Failed to copy text", "error");
    }
  };

  const downloadText = (text: string, type: "original" | "processed") => {
    const cleanText = stripMarkup(text);
    const blob = new Blob([cleanText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const element = window.document.createElement("a");
    element.href = url;
    element.download = `${createFilename(document?.title || "")}-${type}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    URL.revokeObjectURL(url);
    showToast(
      `${type === "original" ? "Original" : "Processed"} text downloaded!`,
      "success"
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Document Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  // If document has no analytics, show a message
  if (!document.analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Analytics Not Available
              </h2>
              <p className="text-gray-600 mb-4">
                This document was created before analytics were implemented.
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => {}}
        />
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {formatDocumentTitle(document.title)}
                </h1>
                <p className="text-sm text-gray-600">
                  Created on {new Date(document.createdAt).toLocaleDateString()}{" "}
                  •{document.wordCount} words • Processed in{" "}
                  {formatProcessingTime(document.processingTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Quality Score
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {document.analytics?.improvementScore?.toFixed(1) || 0}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Readability
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {document.analytics?.readabilityScore?.toFixed(1) || 0}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Time Saved
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {document.analytics?.timeSaved || 0}m
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Improvements
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {document.analytics?.styleImprovements || 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Mechanisms */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-orange-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Processing Mechanisms Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {document.mechanisms.map((mechanism) => (
                <span
                  key={mechanism}
                  className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full text-sm font-medium capitalize"
                >
                  {mechanism}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Original Text */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Original Text</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(document.originalText, "original")
                  }
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadText(document.originalText, "original")
                  }
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkupText(document.originalText),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Processed Text */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Processed Text</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(document.processedText, "processed")
                  }
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadText(document.processedText, "processed")
                  }
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 whitespace-pre-wrap bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkupText(document.processedText),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analytics Scores */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detailed Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Readability Score</span>
                <span className="font-semibold">
                  {document.analytics?.readabilityScore?.toFixed(1) || 0}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sentiment Score</span>
                <span className="font-semibold">
                  {document.analytics?.sentimentScore?.toFixed(1) || 0}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Complexity Score</span>
                <span className="font-semibold">
                  {document.analytics?.complexityScore?.toFixed(1) || 0}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Grammar Issues Fixed</span>
                <span className="font-semibold">
                  {document.analytics?.grammarIssues || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Style Improvements</span>
                <span className="font-semibold">
                  {document.analytics?.styleImprovements || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Density */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.analytics?.keywordDensity ? (
                  Object.entries(document.analytics.keywordDensity)
                    .slice(0, 8)
                    .map(([keyword, density]) => (
                      <div
                        key={keyword}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-700 capitalize">
                          {keyword}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(density * 10, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[3rem]">
                            {density.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No keyword data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
