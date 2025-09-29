import { NextResponse } from "next/server";

export async function GET() {
  // WordWeav icon SVG content - full featured
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ea580c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with gradient -->
  <rect width="32" height="32" rx="4" fill="url(#gradient)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  
  <!-- WordWeav "W" with glow effect -->
  <g filter="url(#glow)">
    <path d="M6 8 L8 24 L11 24 L14 14 L17 24 L20 24 L23 14 L26 24 L29 24 L26 8 L23 8 L19 17 L16 8 L13 8 L10 17 L7 8 Z" 
          fill="white" 
          opacity="0.95"/>
  </g>
  
  <!-- Subtle highlight -->
  <rect width="32" height="8" rx="4" fill="url(#gradient)" opacity="0.2"/>
</svg>`;

  return new NextResponse(iconSvg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, must-revalidate",
      Vary: "Accept-Encoding",
      "X-Icon-Version": "wordweav-enhanced-2025",
    },
  });
}
