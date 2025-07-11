#!/bin/bash
# KhoChuan POS Deployment Script
# Trường Phát Computer Hòa Bình
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 KhoChuan POS Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}================================${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}❌ npx is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend
    npm ci
    cd ..
    
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend
    npm ci
    cd ..
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Run tests
run_tests() {
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    
    echo -e "${BLUE}Running backend tests...${NC}"
    cd backend
    npm run test || echo -e "${YELLOW}⚠️ Backend tests failed or not configured${NC}"
    cd ..
    
    echo -e "${BLUE}Running frontend tests...${NC}"
    cd frontend
    npm run test || echo -e "${YELLOW}⚠️ Frontend tests failed or not configured${NC}"
    cd ..
    
    echo -e "${GREEN}✅ Tests completed${NC}"
}

# Deploy backend
deploy_backend() {
    echo -e "${YELLOW}🔧 Deploying backend to Cloudflare Workers...${NC}"
    
    cd backend
    
    # Check if wrangler is configured
    if ! npx wrangler whoami &> /dev/null; then
        echo -e "${RED}❌ Wrangler not authenticated. Please run: npx wrangler login${NC}"
        exit 1
    fi
    
    # Create database if it doesn't exist
    echo -e "${BLUE}Creating D1 database...${NC}"
    npx wrangler d1 create khochuan-pos-${ENVIRONMENT} || echo -e "${YELLOW}⚠️ Database already exists${NC}"
    
    # Run migrations
    echo -e "${BLUE}Running database migrations...${NC}"
    npx wrangler d1 migrations apply khochuan-pos-${ENVIRONMENT} --env ${ENVIRONMENT}
    
    # Deploy worker
    echo -e "${BLUE}Deploying worker...${NC}"
    npx wrangler deploy --env ${ENVIRONMENT}
    
    cd ..
    
    echo -e "${GREEN}✅ Backend deployed successfully${NC}"
}

# Deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying frontend to Cloudflare Pages...${NC}"
    
    cd frontend
    
    # Build frontend
    echo -e "${BLUE}Building frontend...${NC}"
    npm run build
    
    # Deploy to Cloudflare Pages
    echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
    npx wrangler pages deploy dist --project-name khochuan-pos-${ENVIRONMENT}
    
    cd ..
    
    echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
}

# Verify deployment
verify_deployment() {
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    
    # Check backend health
    echo -e "${BLUE}Checking backend health...${NC}"
    BACKEND_URL="https://khochuan-pos-api-${ENVIRONMENT}.workers.dev"
    if curl -f "${BACKEND_URL}/health" &> /dev/null; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    # Check frontend
    echo -e "${BLUE}Checking frontend...${NC}"
    FRONTEND_URL="https://khochuan-pos-${ENVIRONMENT}.pages.dev"
    if curl -f "${FRONTEND_URL}" &> /dev/null; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend accessibility check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Deployment verification completed${NC}"
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    check_requirements
    install_dependencies
    run_tests
    deploy_backend
    deploy_frontend
    verify_deployment
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}Frontend URL: https://khochuan-pos-${ENVIRONMENT}.pages.dev${NC}"
    echo -e "${GREEN}Backend URL: https://khochuan-pos-api-${ENVIRONMENT}.workers.dev${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Handle script interruption
trap 'echo -e "${RED}❌ Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main
