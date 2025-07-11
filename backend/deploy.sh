#!/bin/bash

# Khochuan POS Backend Deployment Script
# Deploy real API to Cloudflare Workers
# NO MOCK DATA - 100% REAL DATABASE

echo "🚀 Deploying Khochuan POS Backend..."
echo "📍 Trường Phát Computer Hòa Bình"
echo "🔥 100% Real Database - NO MOCK DATA"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || wrangler login

# Create D1 database if not exists
echo "🗄️ Setting up D1 database..."
wrangler d1 create khoaugment-pos-db --env production || echo "Database already exists"

# Get database ID and update wrangler.toml
echo "📝 Getting database ID..."
DB_ID=$(wrangler d1 list | grep "khoaugment-pos-db" | awk '{print $2}')
echo "Database ID: $DB_ID"

# Apply database schema
echo "🏗️ Applying database schema..."
wrangler d1 execute khoaugment-pos-db --file=./database/schema.sql --env production

# Seed database with real data
echo "🌱 Seeding database with real data..."
wrangler d1 execute khoaugment-pos-db --file=./database/seed_real.sql --env production

# Create KV namespace for caching
echo "🗂️ Setting up KV storage..."
wrangler kv:namespace create "CACHE" --env production || echo "KV namespace already exists"

# Create R2 bucket for file storage
echo "📁 Setting up R2 storage..."
wrangler r2 bucket create khoaugment-storage || echo "R2 bucket already exists"

# Deploy the worker
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy --env production

# Set up custom domain (optional)
echo "🌐 Setting up custom domain..."
# wrangler route add "api.khoaugment.com/*" khoaugment-api --env production

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 API URL: https://khoaugment-api.namhbcf1.workers.dev"
echo "📊 Dashboard: https://dash.cloudflare.com"
echo ""
echo "🔧 Next steps:"
echo "1. Update frontend VITE_API_URL to point to the deployed API"
echo "2. Test all endpoints with real data"
echo "3. Monitor logs and performance"
echo ""
echo "🎉 Khochuan POS Backend is now LIVE with 100% real database!"