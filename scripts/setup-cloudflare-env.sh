#!/bin/bash

# KhoAugment POS System - Cloudflare Environment Setup
# This script helps set up the required Cloudflare environment variables for deployment

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}    KhoAugment POS - Cloudflare Environment Setup    ${NC}"
echo -e "${BLUE}==================================================${NC}"

echo -e "\n${YELLOW}This script will help you set up the required Cloudflare environment variables for deployment.${NC}"
echo -e "${YELLOW}You'll need your Cloudflare API token and resource IDs to continue.${NC}\n"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo -e "${RED}ERROR: Wrangler CLI not found.${NC}"
  echo -e "Please install it using: npm install -g wrangler"
  exit 1
fi

# Check if logged in to Cloudflare
echo -e "${BLUE}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &>/dev/null; then
  echo -e "${YELLOW}You need to log in to Cloudflare first.${NC}"
  wrangler login
fi

# Create backend/.env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
  echo -e "${BLUE}Creating backend/.env file...${NC}"
  cp backend/env.example backend/.env
else
  echo -e "${GREEN}backend/.env file already exists.${NC}"
fi

# Function to create D1 database
create_d1_database() {
  echo -e "${BLUE}Creating D1 database...${NC}"
  
  # Create D1 database
  DB_OUTPUT=$(wrangler d1 create khoaugment-db 2>&1)
  
  if [[ $DB_OUTPUT == *"created"* ]]; then
    # Extract database ID from output
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP '(?<=database_id = ")[^"]+')
    echo -e "${GREEN}D1 database created successfully with ID: $DB_ID${NC}"
  elif [[ $DB_OUTPUT == *"already exists"* ]]; then
    echo -e "${YELLOW}D1 database already exists.${NC}"
    echo -e "${YELLOW}Please find your database ID in the Cloudflare dashboard or wrangler.toml file.${NC}"
    echo -e "${YELLOW}Enter your existing D1 database ID:${NC}"
    read -r DB_ID
  else
    echo -e "${RED}Failed to create D1 database. Error: $DB_OUTPUT${NC}"
    echo -e "${YELLOW}Enter your existing D1 database ID (if you have one):${NC}"
    read -r DB_ID
  fi
  
  # Store D1 database ID
  if [ -n "$DB_ID" ]; then
    echo -e "D1_DATABASE_ID=$DB_ID" >> backend/.env
    echo -e "${GREEN}D1 database ID added to backend/.env${NC}"
  else
    echo -e "${RED}No D1 database ID provided.${NC}"
  fi
}

# Function to create KV namespace
create_kv_namespace() {
  echo -e "${BLUE}Creating KV namespace...${NC}"
  
  # Create KV namespace
  KV_OUTPUT=$(wrangler kv:namespace create CACHE 2>&1)
  
  if [[ $KV_OUTPUT == *"created"* ]]; then
    # Extract KV namespace ID from output
    KV_ID=$(echo "$KV_OUTPUT" | grep -oP '(?<=id = ")[^"]+')
    echo -e "${GREEN}KV namespace created successfully with ID: $KV_ID${NC}"
    
    # Create preview namespace
    PREVIEW_KV_OUTPUT=$(wrangler kv:namespace create CACHE --preview 2>&1)
    PREVIEW_KV_ID=$(echo "$PREVIEW_KV_OUTPUT" | grep -oP '(?<=preview_id = ")[^"]+')
    echo -e "${GREEN}KV preview namespace created with ID: $PREVIEW_KV_ID${NC}"
  elif [[ $KV_OUTPUT == *"already exists"* ]]; then
    echo -e "${YELLOW}KV namespace already exists.${NC}"
    echo -e "${YELLOW}Please find your KV namespace ID in the Cloudflare dashboard.${NC}"
    echo -e "${YELLOW}Enter your existing KV namespace ID:${NC}"
    read -r KV_ID
    echo -e "${YELLOW}Enter your existing KV preview namespace ID:${NC}"
    read -r PREVIEW_KV_ID
  else
    echo -e "${RED}Failed to create KV namespace. Error: $KV_OUTPUT${NC}"
    echo -e "${YELLOW}Enter your existing KV namespace ID (if you have one):${NC}"
    read -r KV_ID
    echo -e "${YELLOW}Enter your existing KV preview namespace ID (if you have one):${NC}"
    read -r PREVIEW_KV_ID
  fi
  
  # Store KV namespace IDs
  if [ -n "$KV_ID" ]; then
    echo -e "KV_NAMESPACE_ID=$KV_ID" >> backend/.env
    echo -e "${GREEN}KV namespace ID added to backend/.env${NC}"
  else
    echo -e "${RED}No KV namespace ID provided.${NC}"
  fi
  
  if [ -n "$PREVIEW_KV_ID" ]; then
    echo -e "KV_PREVIEW_NAMESPACE_ID=$PREVIEW_KV_ID" >> backend/.env
    echo -e "${GREEN}KV preview namespace ID added to backend/.env${NC}"
  else
    echo -e "${RED}No KV preview namespace ID provided.${NC}"
  fi
}

# Function to create R2 bucket
create_r2_bucket() {
  echo -e "${BLUE}Creating R2 bucket...${NC}"
  
  # Create R2 bucket
  R2_OUTPUT=$(wrangler r2 bucket create khoaugment-assets 2>&1)
  
  if [[ $R2_OUTPUT == *"created"* ]]; then
    echo -e "${GREEN}R2 bucket created successfully.${NC}"
  elif [[ $R2_OUTPUT == *"already exists"* ]]; then
    echo -e "${YELLOW}R2 bucket already exists.${NC}"
  else
    echo -e "${RED}Failed to create R2 bucket. Error: $R2_OUTPUT${NC}"
  fi
}

# Function to set JWT secret
set_jwt_secret() {
  echo -e "${BLUE}Setting JWT secret...${NC}"
  
  # Generate random JWT secret if not provided
  echo -e "${YELLOW}Enter JWT secret or leave blank to generate a random one:${NC}"
  read -r JWT_SECRET
  
  if [ -z "$JWT_SECRET" ]; then
    # Generate random string using /dev/urandom
    JWT_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*()' </dev/urandom | head -c 32)
    echo -e "${GREEN}Generated JWT secret: $JWT_SECRET${NC}"
  fi
  
  # Store JWT secret
  echo -e "JWT_SECRET=$JWT_SECRET" >> backend/.env
  echo -e "${GREEN}JWT secret added to backend/.env${NC}"
  
  # Set secret in Cloudflare
  echo -e "${BLUE}Setting JWT secret in Cloudflare...${NC}"
  echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
  echo -e "${GREEN}JWT secret set in Cloudflare.${NC}"
}

# Main function
main() {
  # Create D1 database
  create_d1_database
  
  # Create KV namespace
  create_kv_namespace
  
  # Create R2 bucket
  create_r2_bucket
  
  # Set JWT secret
  set_jwt_secret
  
  echo -e "\n${GREEN}==================================================${NC}"
  echo -e "${GREEN}    Environment setup completed successfully!    ${NC}"
  echo -e "${GREEN}==================================================${NC}"
  
  echo -e "\n${YELLOW}Next steps:${NC}"
  echo -e "1. Run ${BLUE}cd backend && npm run db:migrate:prod${NC} to apply database migrations"
  echo -e "2. Run ${BLUE}npm run deploy${NC} to deploy the application"
  echo -e "\n${YELLOW}For more information, see the DEPLOYMENT_GUIDE.md file.${NC}"
}

# Run main function
main 