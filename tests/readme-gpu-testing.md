# KhoAugment POS System - GPU-Accelerated Testing

## Overview

This documentation explains how to run comprehensive GPU-accelerated tests for the KhoAugment POS System using an NVIDIA GTX 1070 graphics card. The testing suite performs thorough checks of all interfaces and functionalities, generating a detailed report of any issues found.

## Requirements

- NVIDIA GTX 1070 GPU
- Latest NVIDIA GPU drivers
- Node.js 16+ and npm
- Linux, macOS, or Windows with WSL2
- X11 display server (for non-headless tests)

## System Setup

### 1. NVIDIA Driver Installation

Ensure you have the appropriate NVIDIA drivers installed for your GTX 1070:

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install nvidia-driver-535 nvidia-utils-535
```

**Windows:**
Download and install the latest drivers from the [NVIDIA website](https://www.nvidia.com/Download/index.aspx).

### 2. Node.js Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

## Running the Tests

### Method 1: Using the automated script (Recommended)

The simplest way to run the tests is using the provided shell script:

```bash
# Make the script executable
chmod +x tests/run-comprehensive-tests.sh

# Run the tests
./tests/run-comprehensive-tests.sh
```

The script will:

1. Check for NVIDIA GPU availability
2. Install necessary dependencies
3. Configure GPU acceleration
4. Run the comprehensive tests
5. Generate a detailed report

### Method 2: Manual execution

If you prefer to run the tests manually:

```bash
# Set environment variables for GPU acceleration
export PLAYWRIGHT_CHROMIUM_USE_ANGLE=1
export DISPLAY=:0  # Adjust if needed

# Run the tests using the GPU test runner
node scripts/gpu-test-runner.js
```

## Test Report

After testing is complete, you'll find the following outputs:

- **Comprehensive Report:** `test-results/comprehensive-report.md`
- **Screenshots:** `test-results/screenshots/`
- **HTML Report:** `test-results/html-report/index.html`
- **JSON Results:** `test-results/test-results.json`

## Understanding the Results

The comprehensive report is organized into sections by issue severity:

1. **Critical Issues:** Blocking problems that prevent core functionality
2. **High Priority Issues:** Significant problems that impact user experience
3. **Medium Priority Issues:** Moderate problems that should be addressed
4. **Low Priority Issues:** Minor issues that can be addressed later
5. **Visual Issues:** UI inconsistencies and display problems
6. **Performance Issues:** Slow loading or processing times

Each issue includes:

- Component affected
- Detailed description
- Screenshot reference (if applicable)

## Test Coverage

The testing suite covers:

1. **Authentication:** Login, logout, permission validation
2. **Admin Interface:** Dashboard, product management, inventory, orders, reports
3. **Cashier Interface:** POS terminal, checkout process, payment handling
4. **AI Features:** Customer segmentation, price optimization, demand forecasting
5. **Mobile Responsiveness:** Adapting to different screen sizes
6. **API Functionality:** Backend endpoint performance and correctness
7. **Performance Metrics:** Loading times and resource utilization
8. **Visual Consistency:** UI presentation across different interfaces

## Troubleshooting

### No GPU Acceleration

If tests run without GPU acceleration:

1. Verify NVIDIA drivers are installed: `nvidia-smi`
2. Ensure X11 server is running for GUI mode
3. Set appropriate environment variables:
   ```bash
   export DISPLAY=:0
   export PLAYWRIGHT_CHROMIUM_USE_ANGLE=1
   ```

### Browser Crashes

If browsers crash during testing:

1. Update to latest browser versions
2. Add more GPU memory headroom with:
   ```
   --disable-gpu-sandbox --disable-web-security
   ```

### Out of Memory Errors

If you encounter memory errors:

1. Increase Node.js memory limit:
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" node scripts/gpu-test-runner.js
   ```

## Further Customization

You can customize the test behavior by modifying:

- **GPU-specific options:** Edit `playwright.config.js` to change browser launch arguments
- **Test timeouts:** Adjust timeout values in `playwright.config.js` for slower systems
- **Test coverage:** Modify `tests/gpu-comprehensive-test.js` to focus on specific areas
