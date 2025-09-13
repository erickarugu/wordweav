import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "RESEND_API_KEY not configured",
          details: "Please add RESEND_API_KEY to your .env.local file",
        },
        { status: 500 }
      );
    }

    // Check API key format
    if (!apiKey.startsWith("re_")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid API key format",
          details: 'Resend API keys should start with "re_"',
        },
        { status: 500 }
      );
    }

    // Test connection to Resend
    try {
      const response = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return NextResponse.json({
          status: "success",
          message: "Resend API connection successful",
          apiKeyConfigured: true,
          apiKeyFormat: "valid",
        });
      } else {
        const errorData = await response.text();
        return NextResponse.json(
          {
            status: "error",
            message: "Resend API connection failed",
            details: errorData,
            statusCode: response.status,
          },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Network error connecting to Resend",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : "Unknown network error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Email health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
