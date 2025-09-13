"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Download } from "lucide-react";

export default function TextProcessor() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const formatOptions = [
    {
      id: "naturalize",
      label: "Natural Language Flow",
      description: "Make text sound more conversational",
    },
    {
      id: "clarity",
      label: "Improve Clarity",
      description: "Enhance readability and understanding",
    },
    {
      id: "tone",
      label: "Adjust Tone",
      description: "Modify writing style and voice",
    },
    {
      id: "structure",
      label: "Better Structure",
      description: "Improve paragraph and sentence organization",
    },
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      // Here you would call your text processing API
      // For now, we'll simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate text processing based on selected options
      let processed = inputText;
      if (selectedOptions.includes("naturalize")) {
        processed = processed.replace(
          /\b(therefore|thus|consequently)\b/gi,
          "so"
        );
      }
      if (selectedOptions.includes("clarity")) {
        processed = processed.replace(/\b(utilize|utilization)\b/gi, "use");
      }

      setOutputText(processed);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your text here to format and humanize..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] text-base"
          />
        </CardContent>
      </Card>

      {/* Options Section */}
      <Card>
        <CardHeader>
          <CardTitle>Formatting Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formatOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedOptions.includes(option.id)
                    ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg scale-105"
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
                <h3 className="font-medium text-gray-900">{option.label}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleProcess}
          disabled={!inputText.trim() || isProcessing}
          className="px-8 py-3 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Text"
          )}
        </Button>
      </div>

      {/* Output Section */}
      {outputText && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Processed Text</CardTitle>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {outputText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
