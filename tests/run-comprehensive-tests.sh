#!/bin/bash

# KhoAugment POS - GPU Comprehensive Test Runner
# This script runs the comprehensive GPU tests for the KhoAugment POS system

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}     KhoAugment POS - GPU Comprehensive Test Runner      ${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to run the tests.${NC}"
    exit 1
fi

# Create test results directory if it doesn't exist
mkdir -p test-results/screenshots

# Check for NVIDIA GPU
echo -e "${YELLOW}Checking for NVIDIA GPU...${NC}"
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}NVIDIA GPU detected:${NC}"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
    HAS_GPU=true
else
    echo -e "${YELLOW}NVIDIA GPU not detected. Tests will run without GPU acceleration.${NC}"
    HAS_GPU=false
fi

# Check if servers are running
echo -e "${YELLOW}Checking if development servers are running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}Frontend server is running.${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}Frontend server is not running. Some tests may fail.${NC}"
    FRONTEND_RUNNING=false
fi

if curl -s http://localhost:8787 > /dev/null; then
    echo -e "${GREEN}Backend server is running.${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}Backend server is not running. Some tests may fail.${NC}"
    BACKEND_RUNNING=false
fi

# Determine which test to run
if [ -f "tests/gpu-comprehensive-test.js" ]; then
    TEST_FILE="tests/gpu-comprehensive-test.js"
    echo -e "${GREEN}Using comprehensive GPU test script.${NC}"
elif [ -f "tests/manual-gpu-test.js" ]; then
    TEST_FILE="tests/manual-gpu-test.js"
    echo -e "${GREEN}Using manual GPU test script.${NC}"
else
    TEST_FILE="tests/basic-test.js"
    echo -e "${YELLOW}Using basic test script (comprehensive tests not found).${NC}"
fi

# Run the tests
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}                 Starting GPU Tests                      ${NC}"
echo -e "${BLUE}=========================================================${NC}"

if [[ "$TEST_FILE" == *"manual-gpu-test.js"* ]]; then
    echo -e "${YELLOW}Running manual GPU test script...${NC}"
    node "$TEST_FILE"
    TEST_EXIT_CODE=$?
else
    echo -e "${YELLOW}Running Playwright test script...${NC}"
    npx playwright test "$TEST_FILE" --config=playwright.config.js
    TEST_EXIT_CODE=$?
fi

# Check test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Tests completed successfully!${NC}"
else
    echo -e "${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
fi

# Generate HTML report
echo -e "${YELLOW}Generating HTML report...${NC}"

if [ -f "test-results/comprehensive-report.md" ]; then
    # Check if we have a template
    if [ -f "tests/report-template.html" ]; then
        cp tests/report-template.html test-results/report-viewer.html
        echo -e "${GREEN}HTML report template copied.${NC}"
    else
        # Create a basic HTML viewer if template doesn't exist
        echo -e "${YELLOW}Creating basic HTML report viewer...${NC}"
        node -e "
            const fs = require('fs');
            const path = require('path');
            const reportContent = fs.readFileSync('test-results/comprehensive-report.md', 'utf8');
            const htmlContent = \`
            <!DOCTYPE html>
            <html>
            <head>
                <title>KhoAugment POS - GPU Test Report</title>
                <meta charset='UTF-8'>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
                    h1, h2, h3 { color: #1890ff; }
                    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                    img { max-width: 100%; border: 1px solid #eee; border-radius: 4px; }
                </style>
                <script src='https://cdn.jsdelivr.net/npm/marked/marked.min.js'></script>
            </head>
            <body>
                <div id='content'></div>
                <script>
                    document.getElementById('content').innerHTML = marked.parse(\\\`${reportContent.replace(/\`/g, '\\\\`')}\\\`);
                </script>
            </body>
            </html>
            \`;
            fs.writeFileSync('test-results/report-viewer.html', htmlContent);
        "
    fi
    
    echo -e "${GREEN}HTML report generated at: test-results/report-viewer.html${NC}"
    
    # Try to open the report
    if command -v xdg-open &> /dev/null; then
        xdg-open test-results/report-viewer.html
    elif command -v open &> /dev/null; then
        open test-results/report-viewer.html
    elif command -v start &> /dev/null; then
        start test-results/report-viewer.html
    else
        echo -e "${YELLOW}Please open the report manually at: test-results/report-viewer.html${NC}"
    fi
else
    echo -e "${RED}No report file found at test-results/comprehensive-report.md${NC}"
fi

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}                 Test Run Completed                      ${NC}"
echo -e "${BLUE}=========================================================${NC}"

exit $TEST_EXIT_CODE 