import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test Google OAuth discovery endpoint
    const response = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Google OAuth endpoints are accessible",
      endpoints: {
        authorization: data.authorization_endpoint,
        token: data.token_endpoint,
        userinfo: data.userinfo_endpoint,
      },
    });
  } catch (error) {
    console.error("Google OAuth test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
