import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "John Doe";

  try {
    const emailHtml = await render(WelcomeEmail({ name }));

    return new NextResponse(emailHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error rendering email preview:", error);
    return NextResponse.json(
      { error: "Failed to render email preview" },
      { status: 500 }
    );
  }
}
