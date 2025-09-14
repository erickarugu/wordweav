"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Clock,
  BarChart3,
  Calendar,
  Loader2,
} from "lucide-react";
import { formatProcessingTime, formatDocumentTitle } from "@/utils/helpers";

interface DocumentData {
  id: string;
  title: string;
  wordCount: number;
  processingTime: number;
  mechanisms: string[];
  createdAt: string;
  analytics: {
    readabilityScore: number;
    improvementScore: number;
    wordsProcessed: number;
    timeSaved: number;
  } | null;
}

interface GroupedDocuments {
  [date: string]: DocumentData[];
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<GroupedDocuments>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetch(
          `/api/text/documents?page=${pageNum}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();

          if (reset) {
            setDocuments(data.documents || []);
          } else {
            setDocuments((prev) => [...prev, ...(data.documents || [])]);
          }

          // Check if there are more pages
          const totalPages = data.pagination?.totalPages || 1;
          setHasMore(pageNum < totalPages);

          // Group documents by date
          const allDocs = reset
            ? data.documents || []
            : [...documents, ...(data.documents || [])];
          groupDocumentsByDate(allDocs);
        } else {
          setError("Failed to load documents");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [documents]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchDocuments(1, true);
    }
  }, [status, session, fetchDocuments, router]);

  const groupDocumentsByDate = (docs: DocumentData[]) => {
    const grouped = docs.reduce((acc: GroupedDocuments, doc) => {
      const date = new Date(doc.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(doc);
      return acc;
    }, {});

    setGroupedDocuments(grouped);
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDocuments(nextPage);
    }
  }, [page, loadingMore, hasMore, fetchDocuments]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-orange-700 font-medium">
            Loading documents...
          </span>
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
              Failed to Load Documents
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
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
                <h1 className="text-3xl font-bold text-gray-800">
                  All Documents
                </h1>
                <p className="text-sm text-gray-600">
                  {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                  processed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {documents.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Documents Found
              </h2>
              <p className="text-gray-600 mb-4">
                Start by processing your first document to see it here!
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Process Your First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedDocuments)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, docs]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {formatDate(date)}
                    </h2>
                    <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
                      {docs.length} document{docs.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {docs.map((doc) => (
                      <Card
                        key={doc.id}
                        className="bg-white/80 backdrop-blur-sm border-orange-200/50 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer"
                        onClick={() => router.push(`/document/${doc.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-orange-700 transition-colors">
                                {formatDocumentTitle(doc.title)}
                              </h3>

                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {doc.analytics?.wordsProcessed ||
                                    doc.wordCount}{" "}
                                  words
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {doc.analytics?.timeSaved
                                    ? `${doc.analytics.timeSaved}m saved`
                                    : formatProcessingTime(doc.processingTime)}
                                </span>
                                {doc.analytics?.improvementScore && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-4 w-4" />
                                    {doc.analytics.improvementScore.toFixed(1)}%
                                    improvement
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {doc.mechanisms?.map((mechanism) => (
                                  <span
                                    key={mechanism}
                                    className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                  >
                                    {mechanism}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-xs text-gray-500">
                                {new Date(doc.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                              {doc.analytics?.readabilityScore && (
                                <div className="text-xs text-gray-500">
                                  Quality:{" "}
                                  {doc.analytics.readabilityScore.toFixed(1)}
                                  /100
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <span className="text-orange-700 font-medium">
                    Loading more documents...
                  </span>
                </div>
              </div>
            )}

            {/* No More Documents Message */}
            {!hasMore && documents.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  You've reached the end of your documents!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
