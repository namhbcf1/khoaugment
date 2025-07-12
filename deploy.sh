#!/bin/bash

# KhoAugment Deployment Script
echo "Starting KhoAugment deployment process..."

# Step 1: Add all changes to git
echo "Adding changes to git..."
git add .

# Step 2: Commit changes
echo "Committing changes..."
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"

# Step 3: Push to GitHub
echo "Pushing to GitHub..."
git push origin main

# Step 4: Deploy frontend to Cloudflare Pages
echo "Deploying frontend to Cloudflare Pages..."
cd frontend
./deploy-pages.sh
cd ..

echo "Deployment process complete!" 