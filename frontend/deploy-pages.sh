#!/bin/bash

# KhoAugment POS - Cloudflare Pages Deployment Script
# This script handles the build and deployment to Cloudflare Pages

echo "🚀 Starting KhoAugment POS deployment to Cloudflare Pages"

# Install dependencies if needed
if [ "$1" == "--install" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Clean up previous build
echo "🧹 Cleaning up previous build..."
rm -rf dist

# Build optimized for Cloudflare Pages
echo "🔨 Building application optimized for Cloudflare Pages..."
npm run build:cloudflare

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Build failed! No dist directory found."
  exit 1
fi

# Check for required configuration files
echo "🔍 Verifying configuration files..."
FILES_OK=true

if [ ! -f "dist/_headers" ]; then
  echo "⚠️ Warning: No _headers file found in dist."
  FILES_OK=false
fi

if [ ! -f "dist/_routes.json" ]; then 
  echo "⚠️ Warning: No _routes.json file found in dist."
  FILES_OK=false
fi

if [ ! -f "dist/.cfpages.yaml" ]; then
  echo "⚠️ Warning: No .cfpages.yaml file found in dist."
  FILES_OK=false
fi

if [ "$FILES_OK" = false ]; then
  echo "❓ Do you want to continue with deployment? (y/n)"
  read -r continue_deploy
  if [ "$continue_deploy" != "y" ]; then
    echo "🛑 Deployment canceled."
    exit 1
  fi
fi

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name khoaugment

echo "✅ Deployment process completed!"
echo "🌎 Your site will be available at: https://khoaugment.pages.dev" 