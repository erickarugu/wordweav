#!/bin/bash

# Favicon Generation Script for WordWeave
# This script converts SVG icons to proper PNG/ICO formats using ImageMagick

echo "🎨 WordWeave Favicon Generation Script"
echo "======================================"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Install it to generate proper PNG/ICO files:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   For now, using SVG files as fallbacks."
    exit 1
fi

cd "$(dirname "$0")/../public"

echo "🔄 Converting SVG icons to PNG/ICO formats..."

# Convert main favicon
convert favicon-16.svg -resize 16x16 favicon.ico
echo "✅ Generated favicon.ico (16x16)"

# Convert Apple touch icon
convert apple-touch-icon.svg -resize 180x180 apple-touch-icon.png
echo "✅ Generated apple-touch-icon.png (180x180)"

# Convert PWA icons
convert icon-192.svg -resize 192x192 icon-192.png
echo "✅ Generated icon-192.png (192x192)"

convert icon-512.svg -resize 512x512 icon-512.png
echo "✅ Generated icon-512.png (512x512)"

# Create additional common sizes
convert icon.svg -resize 32x32 favicon-32x32.png
echo "✅ Generated favicon-32x32.png (32x32)"

convert icon.svg -resize 96x96 favicon-96x96.png
echo "✅ Generated favicon-96x96.png (96x96)"

echo ""
echo "🎉 All favicon formats generated successfully!"
echo "📁 Files created in public/ directory:"
echo "   - favicon.ico (16x16)"
echo "   - favicon-32x32.png (32x32)"
echo "   - favicon-96x96.png (96x96)"
echo "   - apple-touch-icon.png (180x180)"
echo "   - icon-192.png (192x192)"
echo "   - icon-512.png (512x512)"
echo ""
echo "💡 Tip: Test your favicons at https://realfavicongenerator.net/"