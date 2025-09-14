"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Copy,
  Download,
  // Save, // Unused for now
  BarChart3,
  Clock,
  FileText,
} from "lucide-react";
import Toast, { useToast } from "@/components/Toast";
import { formatProcessingTime } from "@/utils/helpers";

interface DocumentAnalytics {
  readabilityScore: number;
  sentimentScore: number;
  complexityScore: number;
  improvementScore: number;
  keywordDensity: Record<string, number>;
  grammarIssues: number;
  styleImprovements: number;
}

interface ProcessingResult {
  document: {
    id: string;
    title: string;
    originalText: string;
    processedText: string;
    wordCount: number;
    processingTime: number;
    mechanisms: string[];
    createdAt: string;
  };
  analytics: DocumentAnalytics;
  usage: {
    wordsUsed: number;
    wordLimit: number;
    wordsRemaining: number;
    timeSaved: number;
  };
}

interface TextProcessorProps {
  onProcessComplete?: () => void;
}

export default function TextProcessor({
  onProcessComplete,
}: TextProcessorProps) {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [usage, setUsage] = useState<{
    wordsUsed?: number;
    wordLimit?: number;
    wordsRemaining?: number;
    timeSaved?: number;
  } | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const { toast, showToast, hideToast } = useToast();

  const formatOptions = [
    {
      id: "naturalize",
      label: "Natural Language Flow",
      description: "Make text sound more conversational and human-like",
      icon: "💬",
    },
    {
      id: "clarity",
      label: "Improve Clarity",
      description: "Replace complex words with simpler, clearer alternatives",
      icon: "🔍",
    },
    {
      id: "tone",
      label: "Adjust Tone",
      description: "Make writing more engaging and less formal",
      icon: "🎭",
    },
    {
      id: "structure",
      label: "Better Structure",
      description: "Improve paragraph flow and sentence organization",
      icon: "📝",
    },
    {
      id: "advanced",
      label: "Advanced Enhancement",
      description: "Apply advanced linguistic improvements and refinements",
      icon: "⚡",
    },
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      showToast("Please enter some text to process", "error");
      return;
    }

    if (selectedOptions.length === 0) {
      showToast("Please select at least one processing option", "error");
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/text/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          title: title.trim() || undefined,
          mechanisms: selectedOptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          showToast(data.message || "Word limit exceeded", "error");
          setUsage({
            wordsRemaining: data.wordsRemaining,
            wordLimit: data.wordLimit,
          });
          return;
        }
        throw new Error(data.error || "Failed to process text");
      }

      const result: ProcessingResult = data;
      setOutputText(result.document.processedText);
      setAnalytics(result.analytics);
      setUsage(result.usage);
      setProcessingTime(Date.now() - startTime);

      showToast(
        `Text processed successfully! Saved ${result.usage.timeSaved} minutes of work.`,
        "success"
      );

      // Call the callback to refresh dashboard data
      if (onProcessComplete) {
        onProcessComplete();
      }
    } catch (error: unknown) {
      console.error("Processing failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing your text";
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Utility function to strip HTML/markdown markup from text
  const stripMarkup = (text: string): string => {
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, "");

    // Remove markdown formatting
    cleaned = cleaned
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Inline code
      .replace(/```[\s\S]*?```/g, "") // Code blocks
      .replace(/#{1,6}\s*/g, "") // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // Images
      .replace(/^\s*[\*\-\+]\s+/gm, "") // Unordered lists
      .replace(/^\s*\d+\.\s+/gm, "") // Ordered lists
      .replace(/^\s*>\s*/gm, "") // Blockquotes
      .replace(/^\s*\-{3,}/gm, "") // Horizontal rules
      .replace(/\n{3,}/g, "\n\n"); // Multiple newlines

    // Clean up extra whitespace
    return cleaned.trim();
  };

  // Function to render text with basic markup support
  const renderMarkupText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split text by newlines to handle paragraphs
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;

      // Process inline formatting
      const processedText = paragraph
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic text
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Inline code
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
        )
        // Simple headers (only at start of paragraph)
        .replace(
          /^#{1,3}\s*(.+)$/gm,
          '<h3 class="font-semibold text-lg mb-2">$1</h3>'
        )
        .replace(
          /^#{4,6}\s*(.+)$/gm,
          '<h4 class="font-medium text-base mb-2">$1</h4>'
        );

      return (
        <div key={pIndex} className="mb-4 last:mb-0">
          <div
            dangerouslySetInnerHTML={{ __html: processedText }}
            className="prose prose-sm max-w-none"
          />
        </div>
      );
    });
  };

  const copyToClipboard = async () => {
    try {
      const plainText = stripMarkup(outputText);
      await navigator.clipboard.writeText(plainText);
      showToast("Plain text copied to clipboard!", "success");
    } catch (error) {
      console.error("Clipboard error:", error);
      showToast("Failed to copy text", "error");
    }
  };

  const downloadText = () => {
    const plainText = stripMarkup(outputText);
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "processed-text"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Plain text file downloaded successfully!", "success");
  };

  const getWordCount = (text: string) => {
    const plainText = stripMarkup(text);
    return plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  };

  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    return Math.ceil(words / 200); // Average reading speed
  };

  return (
    <div className="space-y-8">
      {/* Usage Stats Bar */}
      {usage && (
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4 border border-orange-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-orange-800">
              Monthly Usage
            </span>
            <span className="text-sm text-orange-600">
              {usage.wordsUsed?.toLocaleString()} /{" "}
              {usage.wordLimit?.toLocaleString()} words
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((usage.wordsUsed || 0) / (usage.wordLimit || 1)) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-orange-600">
            <span>
              {usage.wordsRemaining?.toLocaleString()} words remaining
            </span>
            <span>{usage.timeSaved} minutes saved this month</span>
          </div>
        </div>
      )}

      {/* Title Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Title (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Enter a title for your document..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Input Text</span>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {getWordCount(inputText)} words
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />~{getReadingTime(inputText)} min
                read
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your text here to format and humanize...

You can use basic markup:
**bold text**, *italic text*, `code`, # Headers
The AI will preserve and enhance your formatting!"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] text-base resize-none font-mono"
          />
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>
              💡 Markup supported: **bold**, *italic*, `code`, # headers
            </span>
            <span>Copy/download will extract plain text only</span>
          </div>
        </CardContent>
      </Card>

      {/* Options Section */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Options</CardTitle>
          <p className="text-sm text-gray-600">
            Select the enhancements you want to apply to your text
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formatOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedOptions.includes(option.id)
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg ring-2 ring-orange-200"
                    : "border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                }`}
                onClick={() => {
                  setSelectedOptions((prev) =>
                    prev.includes(option.id)
                      ? prev.filter((id) => id !== option.id)
                      : [...prev, option.id]
                  );
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleProcess}
          disabled={
            !inputText.trim() || selectedOptions.length === 0 || isProcessing
          }
          className="px-12 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Processing Your Text...
            </>
          ) : (
            <>
              <BarChart3 className="mr-3 h-6 w-6" />
              Process Text ({selectedOptions.length} enhancement
              {selectedOptions.length !== 1 ? "s" : ""})
            </>
          )}
        </Button>
      </div>

      {/* Output Section */}
      {outputText && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>Processed Text</span>
                {processingTime > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    (Processed in {formatProcessingTime(processingTime)})
                  </span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadText}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-6 rounded-lg border border-orange-100">
                <div className="text-base leading-relaxed text-gray-800 prose prose-gray max-w-none">
                  {renderMarkupText(outputText)}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {getWordCount(outputText)} words
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />~{getReadingTime(outputText)} min
                  read
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Section */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Text Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {analytics.readabilityScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">
                      Readability Score
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {analytics.readabilityScore >= 60
                        ? "Easy to read"
                        : analytics.readabilityScore >= 30
                          ? "Moderate"
                          : "Complex"}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {analytics.improvementScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      Improvement
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {analytics.improvementScore >= 70
                        ? "Excellent"
                        : analytics.improvementScore >= 50
                          ? "Good"
                          : "Moderate"}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {analytics.complexityScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-700 font-medium">
                      Complexity
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {analytics.complexityScore <= 30
                        ? "Simple"
                        : analytics.complexityScore <= 60
                          ? "Moderate"
                          : "Complex"}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {analytics.grammarIssues + analytics.styleImprovements}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">
                      Total Fixes
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Grammar & Style
                    </div>
                  </div>
                </div>

                {/* Keyword Density */}
                {Object.keys(analytics.keywordDensity).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Top Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analytics.keywordDensity)
                        .slice(0, 8)
                        .map(([keyword, density]) => (
                          <span
                            key={keyword}
                            className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
                          >
                            {keyword} ({density.toFixed(1)}%)
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

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
