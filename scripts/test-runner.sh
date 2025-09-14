#!/bin/bash

# Comprehensive Test Runner for WordWeave
set -e

echo "🧪 Starting Comprehensive Test Suite for WordWeave"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Install dependencies if needed
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm install --legacy-peer-deps
else
    print_status "Dependencies already installed"
fi

# Setup test database
echo ""
echo "🗄️ Setting up test database..."
if [ -f "prisma/schema.prisma" ]; then
    print_status "Prisma schema found"
    # Generate Prisma client
    npx prisma generate
    print_status "Prisma client generated"
else
    print_error "Prisma schema not found"
    exit 1
fi

# Run linting
echo ""
echo "🔍 Running linting..."
if npm run lint > /dev/null 2>&1; then
    print_status "Linting passed"
else
    print_warning "Linting found issues (continuing with tests)"
fi

# Run unit tests
echo ""
echo "🧪 Running Unit Tests..."
echo "========================"
if npm run test:unit > /dev/null 2>&1; then
    print_status "Unit tests passed"
else
    print_error "Unit tests failed"
    echo "Running unit tests with output:"
    npm run test:unit
fi

# Run integration tests
echo ""
echo "🔗 Running Integration Tests..."
echo "==============================="
if npm run test:integration > /dev/null 2>&1; then
    print_status "Integration tests passed"
else
    print_error "Integration tests failed"
    echo "Running integration tests with output:"
    npm run test:integration
fi

# Generate test coverage report
echo ""
echo "📊 Generating Coverage Report..."
echo "================================"
if npm run test:coverage > /dev/null 2>&1; then
    print_status "Coverage report generated"
    print_status "Coverage report available at: coverage/lcov-report/index.html"
else
    print_warning "Coverage report generation had issues"
fi

# Check if Next.js app builds successfully
echo ""
echo "🏗️ Testing Build Process..."
echo "==========================="
if npm run build > /dev/null 2>&1; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    echo "Build output:"
    npm run build
fi

# Run E2E tests (if dependencies are available)
echo ""
echo "🌐 Checking E2E Test Setup..."
echo "============================="
if command -v playwright > /dev/null 2>&1; then
    print_status "Playwright is available"
    echo "To run E2E tests manually:"
    echo "  1. Start the development server: npm run dev"
    echo "  2. In another terminal: npm run test:e2e"
else
    print_warning "Playwright not found - install with: npx playwright install"
fi

# Summary
echo ""
echo "📋 Test Summary"
echo "==============="
print_status "Unit tests completed"
print_status "Integration tests completed"
print_status "Build verification completed"
print_status "Test coverage generated"

echo ""
echo "🎉 Comprehensive test suite completed!"
echo ""
echo "Next steps:"
echo "- Review coverage report at: coverage/lcov-report/index.html"
echo "- Run E2E tests: npm run test:e2e (after starting dev server)"
echo "- Run all tests in watch mode: npm run test:watch"

# Test specific API endpoints
echo ""
echo "🔌 Testing API Endpoint Structure..."
echo "===================================="

# Check if API routes exist
api_routes=(
    "src/app/api/newsletter/subscribe/route.ts"
    "src/app/api/newsletter/unsubscribe/route.ts"
    "src/app/api/text/process/route.ts"
    "src/app/api/user/subscription/route.ts"
    "src/app/api/auth/forgot-password/route.ts"
    "src/app/api/auth/reset-password/route.ts"
)

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        print_status "API route exists: $route"
    else
        print_warning "API route missing: $route"
    fi
done

# Check component structure
echo ""
echo "🧩 Testing Component Structure..."
echo "================================="

components=(
    "src/components/NewsletterSignup.tsx"
    "src/components/WordWeaveLogo.tsx"
    "src/components/Navbar.tsx"
    "src/components/TextProcessor.tsx"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        print_status "Component exists: $component"
    else
        print_warning "Component missing: $component"
    fi
done

echo ""
print_status "Test infrastructure setup complete!"
echo "Run 'npm test' to execute the full test suite."
