#!/bin/bash
set -e

echo "🚀 Starting KhoAugment POS deployment..."

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display errors
error() {
  echo -e "${RED}ERROR: $1${NC}"
  exit 1
}

# Function to display info
info() {
  echo -e "${BLUE}INFO: $1${NC}"
}

# Function to display success
success() {
  echo -e "${GREEN}SUCCESS: $1${NC}"
}

# Function to display warning
warning() {
  echo -e "${YELLOW}WARNING: $1${NC}"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  error "Wrangler CLI not found. Please install it globally using: npm install -g wrangler"
fi

# Deploy backend
deploy_backend() {
  info "🔄 Deploying backend to Cloudflare Workers..."
  cd backend
  
  # Check if env file exists
  if [ ! -f ".env" ]; then
    warning "No .env file found. Creating from example..."
    cp env.example .env
    warning "⚠️  Please update .env with your production values before continuing"
  fi
  
  # Check if wrangler.toml has placeholder values
  if grep -q "YOUR_DATABASE_ID_HERE" wrangler.toml; then
    warning "⚠️  Your wrangler.toml contains placeholder values. Please update before deploying."
    warning "Continuing with deployment, but functionality may be limited."
  fi
  
  # Install dependencies
  info "Installing backend dependencies..."
  npm install || error "Failed to install backend dependencies"
  
  # Deploy to production
  info "Deploying backend to Cloudflare Workers..."
  npm run deploy:production || error "Backend deployment failed"
  
  success "✅ Backend deployment completed!"
  
  cd ..
}

# Deploy frontend
deploy_frontend() {
  info "🔄 Deploying frontend to Cloudflare Pages..."
  cd frontend
  
  # Install dependencies
  info "Installing frontend dependencies..."
  npm install || error "Failed to install frontend dependencies"
  
  # Build frontend
  info "Building frontend application..."
  npm run build || error "Frontend build failed"
  
  # Deploy to Cloudflare Pages
  info "Deploying to Cloudflare Pages..."
  if command -v wrangler &> /dev/null; then
    wrangler pages deploy dist --project-name khoaugment-pos || error "Frontend deployment failed"
  else
    error "Wrangler CLI not found for Pages deployment"
  fi
  
  success "✅ Frontend deployment completed!"
  
  cd ..
}

# Setup database
setup_database() {
  info "🔄 Setting up Cloudflare D1 database..."
  cd backend
  
  # Create database if it doesn't exist
  info "Creating database (if it doesn't exist)..."
  wrangler d1 create khoaugment-db 2>/dev/null || true
  
  # Apply migrations
  info "Applying database migrations..."
  npm run db:migrate:prod || warning "Failed to apply migrations. You may need to manually update the database."
  
  cd ..
  
  success "✅ Database setup completed!"
}

# Setup R2 storage
setup_r2() {
  info "🔄 Setting up Cloudflare R2 storage..."
  cd backend
  
  # Create R2 bucket if it doesn't exist
  info "Creating R2 bucket (if it doesn't exist)..."
  wrangler r2 bucket create khoaugment-assets 2>/dev/null || true
  
  cd ..
  
  success "✅ R2 storage setup completed!"
}

# Main deployment process
main() {
  echo "==============================================="
  echo "🏪 KhoAugment POS Deployment - Cloudflare Stack"
  echo "==============================================="
  
  # Setup infrastructure
  info "Setting up infrastructure..."
  setup_database
  setup_r2
  
  # Deploy applications
  deploy_backend
  deploy_frontend
  
  echo "==============================================="
  success "🎉 Deployment completed successfully!"
  echo "==============================================="
  info "📊 Dashboard: https://dash.cloudflare.com"
  info "🔗 Your application should be available at: https://khoaugment-pos.pages.dev"
  echo ""
  warning "⚠️  Remember to set up your custom domain in the Cloudflare Pages dashboard"
  echo "==============================================="
}

# Run main function
main 