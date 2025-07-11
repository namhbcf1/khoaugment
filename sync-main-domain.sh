#!/bin/bash

# ============================================================================
# SYNC MAIN DOMAIN SCRIPT - FORCE UPDATE khoaugment.pages.dev
# ============================================================================

set -e

echo "🔄 Syncing Main Domain: khoaugment.pages.dev"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Build latest frontend
print_info "Step 1: Building latest frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

# Step 2: Deploy to main domain
print_info "Step 2: Deploying to main domain..."
wrangler pages deploy dist --project-name khoaugment --commit-dirty=true
if [ $? -eq 0 ]; then
    print_status "Deployment completed"
else
    print_error "Deployment failed"
    exit 1
fi

cd ..

# Step 3: Wait for propagation
print_info "Step 3: Waiting for DNS propagation..."
sleep 10

# Step 4: Test main domain
print_info "Step 4: Testing main domain..."
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://khoaugment.pages.dev" || echo "000")
if [ "$MAIN_STATUS" = "200" ]; then
    print_status "Main domain is accessible"
else
    print_warning "Main domain status: $MAIN_STATUS"
fi

# Step 5: Summary
echo ""
echo "=============================================="
print_status "SYNC COMPLETED!"
echo ""
print_info "🎯 Main Domain: https://khoaugment.pages.dev"
print_info "🧪 Latest Test: https://84ae7a35.khoaugment.pages.dev"
print_info "🔧 Backend API: https://khoaugment-api.bangachieu2.workers.dev"
echo ""
print_warning "Note: If main domain still shows old content:"
echo "  1. Clear browser cache (Ctrl+F5)"
echo "  2. Wait 5-10 minutes for CDN propagation"
echo "  3. Try incognito/private browsing mode"
echo ""
print_status "Both domains should now be synchronized!"
echo "=============================================="
