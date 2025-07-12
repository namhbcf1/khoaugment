# KhoAugment POS Integration Testing

## Overview

This directory contains comprehensive integration tests for the KhoAugment POS system, specifically designed for Cloudflare's edge computing environment. These tests verify the correct functionality of our entire stack:

- Frontend React application on Cloudflare Pages
- Backend Cloudflare Workers using Hono.js
- D1 Database operations
- R2 Storage functionality
- Vietnamese language and character support
- Payment processing integrations

## Prerequisites

- Node.js 16+
- npm or yarn
- Playwright test runner
- Access credentials for test environments

## Getting Started

### 1. Set up environment variables

Create a `.env` file in the project root with the following variables:

```
TEST_BASE_URL=https://khoaugment.pages.dev
TEST_API_URL=https://khoaugment-api.workers.dev
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=yourpassword
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the tests

```bash
# Run using our script (recommended)
./scripts/run-integration-tests.sh

# Or run manually
npx playwright test --config=tests/integration.config.js
```

## Test Files

- `integration-suite.js` - Core test cases
- `integration.config.js` - Playwright configuration
- `integration-global-setup.js` - Environment setup and authentication
- `integration-dashboard.html` - Visual test results dashboard

## Test Coverage

The tests cover several critical aspects of the KhoAugment POS system:

### 1. API Health and Connectivity

- Health check endpoints
- Database connectivity
- Storage connectivity

### 2. Frontend Functionality

- Page loading and rendering
- Vietnamese character support
- Responsive design

### 3. Authentication

- Login flow
- Token-based authentication
- Session management

### 4. Core POS Functionality

- Product search with Vietnamese characters
- Order processing
- Payment handling (including Vietnamese payment providers)

### 5. Cloudflare Service Limits

- D1 database performance under concurrent requests
- R2 storage upload and retrieval performance
- Worker CPU time limit testing
- Edge caching effectiveness

## Understanding the Results

After running tests, several output files are generated in the `test-results` directory:

- `integration-results.json` - Raw test results
- HTML reports in the `artifacts` directory
- Screenshots of failed tests

### Visual Dashboard

For a visual representation of test results, open:

```
test-results/integration-dashboard.html
```

This dashboard displays:

- Pass/fail statistics
- API response times
- Cloudflare service performance
- Detailed test results with Vietnamese localization

## Cloudflare-Specific Considerations

### 1. Rate Limiting

The test runner is configured to respect Cloudflare's rate limits by limiting concurrent tests. This helps avoid triggering WAF rules.

### 2. Resource Limits

Tests are designed to stay within Cloudflare's free tier limits:

- Workers: 100k requests/day, 10ms CPU time limit
- D1: 5k rows read/write per day
- R2: 10GB storage and limited operations

### 3. Vietnamese Character Support

The test suite validates proper UTF-8 encoding and handling of Vietnamese characters throughout the system.

## Troubleshooting

### Common Issues

1. **API Connection Failures**

   - Verify your TEST_API_URL environment variable
   - Check if Cloudflare Workers service is running

2. **Authentication Failures**

   - Ensure your test user credentials are correct
   - Check if the auth token is being properly stored

3. **Vietnamese Character Encoding Issues**
   - Ensure your terminal supports UTF-8
   - Verify database collation settings

### Debugging

For detailed logs, run tests with increased verbosity:

```bash
DEBUG=pw:api npx playwright test --config=tests/integration.config.js
```

## Continuous Integration

These tests are designed to run in CI environments. Special considerations:

- Tests automatically adapt to CI environments
- Retries are enabled for flaky tests
- Reports are generated in machine-readable formats

## Contributing

When adding new tests, follow these guidelines:

- Maintain isolation between test cases
- Clean up any test data created
- Support Vietnamese character testing
- Stay within Cloudflare resource limits
- Document any new environment variables

## License

This test suite is part of the KhoAugment POS system and is subject to the same license terms.
