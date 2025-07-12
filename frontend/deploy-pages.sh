#!/bin/bash

# Cloudflare Pages Deployment Script
echo "Starting deployment to Cloudflare Pages..."

# Build the project
echo "Building the project..."
npm run build

# Copy headers and redirects to dist folder
echo "Copying headers and redirects files..."
cp public/_headers dist/
cp public/_redirects dist/

# Deploy to Cloudflare Pages using wrangler
echo "Deploying to Cloudflare Pages..."
npx wrangler pages publish dist --project-name khoaugment

echo "Deployment complete!" 