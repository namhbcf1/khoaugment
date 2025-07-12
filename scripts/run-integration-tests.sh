#!/bin/bash

# Set script to exit on error
set -e

# Load environment variables if .env file exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Default test environment if not provided
export TEST_BASE_URL=${TEST_BASE_URL:-"https://khoaugment.pages.dev"}
export TEST_API_URL=${TEST_API_URL:-"https://khoaugment-api.workers.dev"}

# Colorful output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    KhoAugment Integration Tests       ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}Testing against:${NC}"
echo -e "  Frontend: ${TEST_BASE_URL}"
echo -e "  API:      ${TEST_API_URL}"
echo ""

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is required but not installed.${NC}"; exit 1; }
command -v playwright >/dev/null 2>&1 || { echo -e "${YELLOW}Warning: playwright CLI not found, attempting to install dependencies...${NC}"; }

# Ensure dependencies are installed
echo -e "${BLUE}Checking dependencies...${NC}"
npm ci || npm install

# Ensure Playwright browsers are installed
echo -e "${BLUE}Ensuring Playwright browsers are installed...${NC}"
npx playwright install --with-deps chromium firefox webkit

# Create results directory if it doesn't exist
mkdir -p test-results

# Cloudflare-specific checks
echo -e "${BLUE}Checking Cloudflare connectivity...${NC}"
if curl -s --head "${TEST_API_URL}/api/health" | grep "200" > /dev/null; then
  echo -e "${GREEN}✓ API endpoint is accessible${NC}"
else
  echo -e "${YELLOW}⚠ Warning: Could not reach API endpoint. Tests may fail.${NC}"
fi

# Check for Vietnamese language support
echo -e "${BLUE}Checking Vietnamese language support...${NC}"
# Simple test to verify encoding works
VIET_TEST=$(echo "Xin chào Việt Nam" | od -t x1)
if [[ $VIET_TEST == *"c3 a0"* ]]; then
  echo -e "${GREEN}✓ Terminal supports Vietnamese characters${NC}"
else
  echo -e "${YELLOW}⚠ Warning: Terminal may not fully support Vietnamese characters${NC}"
fi

# Run tests based on environment
echo -e "${BLUE}Running integration tests...${NC}"
echo -e "Test configuration: tests/integration.config.js"

# Detect Cloudflare WAF
echo -e "${BLUE}Checking Cloudflare security features...${NC}"
CF_WAF=$(curl -s -I "${TEST_API_URL}" | grep -i "cf-waf")
if [[ ! -z "$CF_WAF" ]]; then
  echo -e "${YELLOW}⚠ Cloudflare WAF detected. Using conservative rate limiting.${NC}"
  TEST_CONCURRENCY=2
else
  TEST_CONCURRENCY=4
fi

# Run the tests
npx playwright test --config=tests/integration.config.js --workers=${TEST_CONCURRENCY}

# Check the test results
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check the report for details.${NC}"
  
  # Generate report file path
  REPORT_PATH="test-results/integration-results.json"
  if [ -f "$REPORT_PATH" ]; then
    FAILED=$(grep -o '"status":"failed"' "$REPORT_PATH" | wc -l)
    PASSED=$(grep -o '"status":"passed"' "$REPORT_PATH" | wc -l)
    TOTAL=$((FAILED + PASSED))
    
    echo -e "${YELLOW}Test Summary: $PASSED passed, $FAILED failed, $TOTAL total${NC}"
    
    # Extract failing tests for quick view
    echo -e "${YELLOW}Failed tests:${NC}"
    grep -B 1 -A 1 '"status":"failed"' "$REPORT_PATH" | grep "title" | sort | uniq | sed 's/"title"://g' | sed 's/,//g' | sed 's/"//g' | sed 's/^/  - /'
    
    # Open HTML report
    if [ "$CI" != "true" ]; then
      echo -e "${BLUE}Opening HTML report...${NC}"
      npx playwright show-report test-results/artifacts/
    fi
  fi
  
  exit 1
fi 