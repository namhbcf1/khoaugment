#!/bin/bash

# Set script to exit on error
set -e

# Colorful output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  KhoAugment Tests - Cloudflare Deploy ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Login to Cloudflare if needed
echo -e "${BLUE}Checking Cloudflare login status...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Cloudflare:${NC}"
    wrangler login
fi

# Get current date for versioning
DEPLOY_DATE=$(date +"%Y%m%d%H%M%S")
TEST_NAMESPACE="khoaugment-integration-tests"
TEST_WORKER_NAME="${TEST_NAMESPACE}-${DEPLOY_DATE}"

echo -e "${BLUE}Creating temporary worker directory...${NC}"
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: ${TEMP_DIR}"

# Create a simple worker for the test monitor
cat > "${TEMP_DIR}/index.js" << 'EOF'
/**
 * KhoAugment Integration Test Monitor
 * This worker provides a simple dashboard and API to run integration tests.
 */

import { Router } from 'itty-router'

// Create a new router
const router = Router()

// HTML template for the dashboard
const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KhoAugment Integration Test Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: #4f46e5;
      --success-color: #22c55e;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
    }
    
    body {
      font-family: 'Roboto', sans-serif;
      line-height: 1.6;
      color: var(--gray-800);
      background-color: var(--gray-50);
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      background-color: var(--primary-color);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    header h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    
    header p {
      margin: 0.5rem 0 0;
      opacity: 0.85;
    }

    .card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .card-header h2 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--gray-800);
    }

    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      font-weight: 500;
      color: white;
      background-color: var(--primary-color);
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .btn:hover {
      background-color: #4338ca;
    }
    
    .btn-success {
      background-color: var(--success-color);
    }
    
    .btn-success:hover {
      background-color: #16a34a;
    }
    
    .btn-danger {
      background-color: var(--danger-color);
    }
    
    .btn-danger:hover {
      background-color: #dc2626;
    }
    
    pre {
      background-color: var(--gray-800);
      color: var(--gray-200);
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }
    
    .badge-success {
      background-color: #dcfce7;
      color: #15803d;
    }
    
    .badge-warning {
      background-color: #fef3c7;
      color: #a16207;
    }
    
    .badge-danger {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.375rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .stat-card {
      background-color: white;
      padding: 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border-left: 4px solid var(--primary-color);
      display: flex;
      flex-direction: column;
    }
    
    .stat-title {
      font-size: 0.875rem;
      color: var(--gray-500);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--gray-800);
    }
    
    .stat-description {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--gray-500);
    }
    
    /* Vietnamese specific styles */
    .vietnamese-text {
      font-family: 'Roboto', sans-serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>KhoAugment Integration Test Dashboard</h1>
      <p class="vietnamese-text">Bảng điều khiển kiểm tra tích hợp</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Worker Status</div>
        <div class="stat-value" id="worker-status">Active</div>
        <div class="stat-description">Trạng thái Worker</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">Deploy Time</div>
        <div class="stat-value" id="deploy-time">DEPLOY_TIMESTAMP</div>
        <div class="stat-description">Thời gian triển khai</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">API URL</div>
        <div class="stat-value" id="api-url">API_URL</div>
        <div class="stat-description">URL API</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">Frontend URL</div>
        <div class="stat-value" id="frontend-url">FRONTEND_URL</div>
        <div class="stat-description">URL giao diện</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Run Integration Tests</h2>
      </div>
      <div>
        <p>Select the tests you want to run:</p>
        <div class="form-group">
          <label for="test-suite">Test Suite</label>
          <select id="test-suite">
            <option value="all">All Tests</option>
            <option value="api">API Tests</option>
            <option value="frontend">Frontend Tests</option>
            <option value="d1">D1 Database Tests</option>
            <option value="r2">R2 Storage Tests</option>
            <option value="vietnamese">Vietnamese Language Tests</option>
          </select>
        </div>
        <div class="form-group">
          <label for="browser">Browser</label>
          <select id="browser">
            <option value="chrome">Chrome</option>
            <option value="firefox">Firefox</option>
            <option value="webkit">WebKit (Safari)</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="headless"> Run in headless mode
          </label>
        </div>
        <button class="btn btn-success" id="run-tests">Run Tests</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Test Results</h2>
      </div>
      <div id="test-results">
        <p>No tests have been run yet.</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>API Health</h2>
      </div>
      <div>
        <button class="btn" id="check-health">Check Health</button>
        <div id="health-results" class="mt-4">
          <p>Click "Check Health" to verify API connectivity.</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="vietnamese-text">Kiểm tra tiếng Việt</h2>
      </div>
      <div>
        <p class="vietnamese-text">Đây là văn bản tiếng Việt để kiểm tra khả năng hiển thị tiếng Việt. Một số ví dụ:</p>
        <ul>
          <li class="vietnamese-text">Các chữ cái có dấu: ă, â, đ, ê, ô, ơ, ư</li>
          <li class="vietnamese-text">Các dấu: huyền, sắc, hỏi, ngã, nặng</li>
          <li class="vietnamese-text">Ví dụ: Xin chào Việt Nam!</li>
        </ul>
      </div>
    </div>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Set API URL
      document.getElementById('api-url').textContent = window.location.origin;
      
      // Set Frontend URL
      document.getElementById('frontend-url').textContent = 'FRONTEND_URL_PLACEHOLDER';
      
      // Health check button
      document.getElementById('check-health').addEventListener('click', async function() {
        const healthResults = document.getElementById('health-results');
        healthResults.innerHTML = '<p>Checking API health...</p>';
        
        try {
          const response = await fetch('/api/health');
          const data = await response.json();
          
          healthResults.innerHTML = `
            <div class="badge ${data.status === 'ok' ? 'badge-success' : 'badge-danger'}">
              Status: ${data.status}
            </div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          `;
        } catch (error) {
          healthResults.innerHTML = `
            <div class="badge badge-danger">Error</div>
            <pre>${error.message}</pre>
          `;
        }
      });
      
      // Run tests button
      document.getElementById('run-tests').addEventListener('click', async function() {
        const testSuite = document.getElementById('test-suite').value;
        const browser = document.getElementById('browser').value;
        const headless = document.getElementById('headless').checked;
        
        const testResults = document.getElementById('test-results');
        testResults.innerHTML = '<p>Running tests...</p>';
        
        try {
          const response = await fetch('/api/run-tests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              testSuite,
              browser,
              headless
            })
          });
          
          const data = await response.json();
          
          testResults.innerHTML = `
            <div class="badge ${data.success ? 'badge-success' : 'badge-danger'}">
              ${data.success ? 'Success' : 'Failed'}
            </div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          `;
        } catch (error) {
          testResults.innerHTML = `
            <div class="badge badge-danger">Error</div>
            <pre>${error.message}</pre>
          `;
        }
      });
    });
  </script>
</body>
</html>`;

// Handle root route - show the dashboard
router.get('/', () => {
  return new Response(dashboardHtml.replace('DEPLOY_TIMESTAMP', new Date().toISOString()), {
    headers: {
      'Content-Type': 'text/html',
    },
  })
})

// API health check endpoint
router.get('/api/health', () => {
  return new Response(JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    cloudflare: {
      datacenter: 'mock-datacenter',
      worker: 'khoaugment-integration-tests',
    },
    services: {
      d1: { status: 'connected' },
      r2: { status: 'connected' },
      kv: { status: 'connected' },
    },
    vietnamese: {
      support: true,
      encoding: 'UTF-8',
      example: 'Xin chào Việt Nam',
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

// Run tests endpoint - mock implementation
router.post('/api/run-tests', async request => {
  const body = await request.json()
  const { testSuite, browser, headless } = body
  
  // In a real implementation, this would trigger actual tests
  // For now, we'll just return a mock result
  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    config: { testSuite, browser, headless },
    results: {
      total: 10,
      passed: 8,
      failed: 2,
      skipped: 0,
      duration: 5230, // ms
    },
    tests: [
      { name: 'API health check', status: 'passed', duration: 120 },
      { name: 'Frontend loads correctly', status: 'passed', duration: 950 },
      { name: 'Login flow works correctly', status: 'passed', duration: 1100 },
      { name: 'Product search with Vietnamese characters', status: 'passed', duration: 780 },
      { name: 'Create order with Vietnamese product', status: 'passed', duration: 1200 },
      { name: 'D1 database performance under concurrent requests', status: 'passed', duration: 340 },
      { name: 'R2 storage upload and retrieval performance', status: 'passed', duration: 450 },
      { name: 'Vietnamese payment processing', status: 'failed', duration: 180, error: 'VNPay integration failed' },
      { name: 'Worker CPU time limit test', status: 'passed', duration: 110 },
      { name: 'Edge caching effectiveness', status: 'failed', duration: 0, error: 'Cache headers missing' }
    ]
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

// 404 for everything else
router.all('*', () => new Response('Not Found', { status: 404 }))

// Export a default object containing event handlers
export default {
  async fetch(request, env, ctx) {
    return router.handle(request)
  }
}
EOF

# Create wrangler.toml file for the test monitor
cat > "${TEMP_DIR}/wrangler.toml" << EOF
name = "${TEST_WORKER_NAME}"
main = "index.js"
compatibility_date = "2023-10-30"
compatibility_flags = ["nodejs_compat"]

[vars]
TEST_ENVIRONMENT = "cloudflare"
FRONTEND_URL = "https://khoaugment.pages.dev"
API_URL = "https://khoaugment-api.workers.dev"

[build]
command = ""
watch_dir = ""

[env.production]
name = "${TEST_WORKER_NAME}-prod"
EOF

# Create package.json
cat > "${TEMP_DIR}/package.json" << EOF
{
  "name": "khoaugment-integration-tests",
  "version": "1.0.0",
  "private": true,
  "description": "KhoAugment Integration Test Monitor",
  "main": "index.js",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev"
  },
  "dependencies": {
    "itty-router": "^3.0.12"
  }
}
EOF

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
cd "${TEMP_DIR}"
npm install

# Deploy the worker
echo -e "${BLUE}Deploying integration test monitor to Cloudflare...${NC}"
wrangler deploy

# Get the worker URL
WORKER_URL=$(wrangler dev --remote | grep -o 'https://.*workers.dev' | head -n 1 || echo "https://${TEST_WORKER_NAME}.workers.dev")

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "Integration test monitor is available at:"
echo -e "${GREEN}${WORKER_URL}${NC}"
echo -e "\nTest monitor provides:"
echo -e "- Interactive test dashboard"
echo -e "- API health checking"
echo -e "- Vietnamese language validation"
echo -e "- Mock test execution (for demonstration)"

echo -e "\n${YELLOW}Note: For full test execution, you'll need to extend this worker${NC}"
echo -e "or use the provided scripts to run tests against your environment."

# Clean up
echo -e "\n${BLUE}Cleaning up temporary files...${NC}"
cd -
rm -rf "${TEMP_DIR}"

echo -e "\n${GREEN}Done!${NC}" 