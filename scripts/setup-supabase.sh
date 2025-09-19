#!/bin/bash

# Supabase Migration Setup Script
# This script sets up both staging and production Supabase databases

set -e

echo "🚀 Starting Supabase Migration Setup..."

#!/bin/bash

# Setup Supabase Production Database
# This script sets up the production Supabase database

set -e

echo "🔧 Setting up Supabase production database..."

# Check if required environment variables are set
if [ -z "$SUPABASE_PROD_URL" ]; then
  echo "❌ Error: Missing required environment variables"
  echo "Please set SUPABASE_PROD_URL in your .env file"
  exit 1
fi

echo "✅ Environment variables found"

# 1. Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# 2. Apply database schema to Supabase production (using current DATABASE_URL)
echo "🗄️  Applying schema to Supabase production database..."
npx prisma db push --accept-data-loss

echo "✅ Schema applied to production database"

# 3. Run the migration script to move data from local to Supabase production
echo "📊 Migrating data from local PostgreSQL to Supabase production..."
npx tsx scripts/migrate-to-supabase.ts

echo "✅ Data migration completed"

echo ""
echo "🎉 Supabase migration setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   ✅ Production database: Schema applied and data migrated"
echo ""
echo "📖 Next steps:"
echo "   1. Set NODE_ENV=production to use Supabase in production"
echo "   2. For development, use local PostgreSQL (default when NODE_ENV!=production)"
echo ""
echo "🔗 Database URLs:"
echo "   Production: $SUPABASE_PROD_URL"
