#!/bin/bash
# KhoAugment POS - Local Development Startup Script

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    KhoAugment POS - Local Development       ${NC}"
echo -e "${BLUE}==============================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 16.0.0 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d "v" -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d "." -f 1)

if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
    echo -e "${RED}Node.js version 16.0.0 or higher is required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Check if wrangler is installed
if ! command_exists wrangler; then
    echo -e "${YELLOW}Wrangler CLI is not installed globally. Installing...${NC}"
    npm install -g wrangler
fi

# Setup backend environment if .env doesn't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}No backend/.env file found. Setting up...${NC}"
    cp backend/env.example backend/.env
    echo -e "${YELLOW}Please update backend/.env with your configuration.${NC}"
fi

# Setup frontend environment if .env doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}No frontend/.env file found. Setting up...${NC}"
    echo "VITE_API_URL=http://localhost:8787" > frontend/.env
fi

# Check if Wrangler is logged in
echo -e "${BLUE}Checking Cloudflare login status...${NC}"
if ! wrangler whoami &>/dev/null; then
    echo -e "${YELLOW}Not logged in to Cloudflare. Please login:${NC}"
    wrangler login
fi

# Setup local database for development
echo -e "${BLUE}Setting up local development database...${NC}"
cd backend
echo -e "${YELLOW}Creating D1 database locally...${NC}"
wrangler d1 create khoaugment-db --local &>/dev/null || true

echo -e "${YELLOW}Applying database migrations...${NC}"
npm run db:migrate

echo -e "${YELLOW}Seeding database with initial data...${NC}"
npm run db:seed
cd ..

# Start development servers
echo -e "${BLUE}Starting development servers...${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}Backend: http://localhost:8787${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"

npm run dev 