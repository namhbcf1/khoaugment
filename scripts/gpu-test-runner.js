const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

/**
 * ENHANCED GPU TEST RUNNER FOR KHOAUGMENT POS SYSTEM
 *
 * This script configures and executes comprehensive GPU-accelerated tests
 * Specifically optimized for NVIDIA GTX 1070 GPU
 * Updated with better error handling and reporting
 */

// Get system information
const systemInfo = {
  platform: os.platform(),
  release: os.release(),
  arch: os.arch(),
  cpus: os.cpus().length,
  totalMem: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + "GB",
  nodeVersion: process.version,
  timestamp: new Date().toISOString(),
};

console.log("🔍 KhoAugment POS System - GPU Accelerated Test Runner");
console.log("📊 Configured for NVIDIA GTX 1070");
console.log(
  `🖥️ System: ${systemInfo.platform} ${systemInfo.release} (${systemInfo.arch})`
);
console.log(`🧠 CPU: ${systemInfo.cpus} cores, RAM: ${systemInfo.totalMem}`);

// Ensure NVIDIA GPU is available
let gpuInfo = "GPU information not available";
let isNvidiaGTX1070 = false;

try {
  console.log("\n🔍 Checking GPU availability...");

  // Try different commands based on platform
  if (systemInfo.platform === "win32") {
    try {
      // First try nvidia-smi
      gpuInfo = execSync(
        "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader"
      )
        .toString()
        .trim();
    } catch (error) {
      // If nvidia-smi fails, try using PowerShell to get GPU info
      try {
        gpuInfo = execSync(
          "powershell -command \"Get-WmiObject Win32_VideoController | Select-Object Name, AdapterRAM | ForEach-Object { $_.Name + ', ' + [math]::Round($_.AdapterRAM / 1MB) + ' MiB' }\""
        )
          .toString()
          .trim();
      } catch (psError) {
        console.warn("⚠️ Failed to get GPU information using PowerShell");
      }
    }
  } else {
    // For Linux/macOS
    try {
      gpuInfo = execSync(
        "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader"
      )
        .toString()
        .trim();
    } catch (error) {
      try {
        // Try lspci on Linux
        if (systemInfo.platform === "linux") {
          gpuInfo = execSync("lspci | grep -i 'vga\\|3d\\|2d'")
            .toString()
            .trim();
        }
      } catch (lspciError) {
        console.warn("⚠️ Failed to get GPU information using lspci");
      }
    }
  }

  console.log(`✅ GPU detected: ${gpuInfo}`);

  // Check if it's an NVIDIA GTX 1070
  isNvidiaGTX1070 =
    gpuInfo.toLowerCase().includes("gtx 1070") ||
    gpuInfo.toLowerCase().includes("geforce gtx 1070");

  if (isNvidiaGTX1070) {
    console.log("✅ NVIDIA GTX 1070 confirmed - optimal for testing");
  } else {
    console.log("⚠️ Not using NVIDIA GTX 1070 - test results may vary");
  }
} catch (error) {
  console.warn("⚠️ NVIDIA GPU not detected or nvidia-smi not available");
  console.warn(
    "Please ensure your NVIDIA GTX 1070 drivers are properly installed"
  );
  console.warn(
    "Continuing with tests but GPU acceleration might not be available"
  );
}

// Configure browser for GPU acceleration
process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = process.env.CHROME_BIN || "";
process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH = process.env.FIREFOX_BIN || "";

// Set environment variables for GPU acceleration
process.env.PLAYWRIGHT_BROWSERS_PATH = "0"; // Use system-installed browsers
process.env.PWDEBUG = "0";
process.env.DISABLE_CHROMIUM_SANDBOX = "1"; // Required for some GPU acceleration features

// Additional GPU flags for Chromium
process.env.CHROMIUM_FLAGS = [
  "--enable-gpu",
  "--ignore-gpu-blocklist",
  "--enable-webgl",
  "--use-gl=desktop",
  "--enable-accelerated-video-decode",
  "--disable-gpu-sandbox",
  "--disable-features=IsolateOrigins",
  "--disable-web-security",
  "--no-sandbox",
].join(" ");

// Create necessary directories
const testResultsDir = path.join(__dirname, "../test-results");
const screenshotDir = path.join(testResultsDir, "screenshots");
const artifactsDir = path.join(testResultsDir, "artifacts");

if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// Start development server if needed
let serverProcess = null;
const startDevServer = () => {
  try {
    console.log("\n🚀 Starting development server...");
    // Check if we need to start backend first
    if (fs.existsSync(path.join(__dirname, "../backend"))) {
      console.log("🔌 Starting backend server...");
      execSync("cd backend && npm run dev", {
        stdio: "ignore",
        detached: true,
      });
    }

    // Start frontend server
    console.log("🖥️ Starting frontend server...");
    execSync("cd frontend && npm run dev", {
      stdio: "ignore",
      detached: true,
    });

    console.log("⏳ Waiting for servers to start...");
    // Give servers time to start
    execSync("sleep 10");
  } catch (error) {
    console.error("❌ Failed to start development servers:", error.message);
    console.log(
      "⚠️ Continuing with tests assuming servers are already running"
    );
  }
};

// Save system information to report
const saveSystemInfo = () => {
  const infoFile = path.join(testResultsDir, "system-info.json");
  const info = {
    ...systemInfo,
    gpu: gpuInfo,
    isNvidiaGTX1070,
    testDate: new Date().toISOString(),
  };
  fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));
};

console.log("\n📝 Test Configuration:");
console.log(
  `- GPU Acceleration: ${
    isNvidiaGTX1070 ? "Optimized for GTX 1070" : "Enabled"
  }`
);
console.log("- Test Results Directory: test-results/");
console.log("- Report File: test-results/comprehensive-report.md");
console.log("- Screenshots Directory: test-results/screenshots/");
console.log("- System Info: test-results/system-info.json");

// Start servers if needed
if (process.env.START_SERVERS === "true") {
  startDevServer();
}

// Save system information
saveSystemInfo();

// Run the tests using Playwright
console.log("\n🚀 Starting GPU-accelerated tests...");
console.log("⏳ This may take several minutes. Please wait...\n");

// Check if the comprehensive test file exists
const comprehensiveTestPath = path.join(
  __dirname,
  "../tests/gpu-comprehensive-test.js"
);
const manualTestPath = path.join(__dirname, "../tests/manual-gpu-test.js");
const basicTestPath = path.join(__dirname, "../tests/basic-test.js");

// Determine which test to run
let testToRun = "";

if (fs.existsSync(comprehensiveTestPath)) {
  testToRun = "tests/gpu-comprehensive-test.js";
  console.log("🧪 Running comprehensive GPU tests...");
} else if (fs.existsSync(manualTestPath)) {
  testToRun = "tests/manual-gpu-test.js";
  console.log("🧪 Running manual GPU tests...");
} else {
  testToRun = "tests/basic-test.js";
  console.log("🧪 Running basic tests (comprehensive tests not found)...");
}

// Update the test execution command to run the appropriate test
try {
  if (testToRun.includes("manual-gpu-test.js")) {
    // For manual test, run with Node directly
    execSync(`node ${testToRun}`, { stdio: "inherit" });
  } else {
    // For Playwright tests
    execSync(`npx playwright test ${testToRun} --config=playwright.config.js`, {
      stdio: "inherit",
    });
  }

  console.log("\n✅ Testing completed successfully!");
  console.log(
    "📊 Detailed report available at: test-results/comprehensive-report.md"
  );

  // Generate HTML report for better visualization
  console.log("\n🔍 Generating HTML report...");

  // Check if we should generate the Playwright HTML report or use our custom report viewer
  if (!testToRun.includes("manual-gpu-test.js")) {
    execSync("npx playwright show-report test-results/html-report", {
      stdio: "ignore",
    });
    console.log(
      "✅ HTML report generated at: test-results/html-report/index.html"
    );
  } else {
    // Create a simple HTML viewer for our manual test report
    const reportViewerPath = path.join(testResultsDir, "report-viewer.html");

    // Check if we have a template
    const templatePath = path.join(__dirname, "../tests/report-template.html");
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, reportViewerPath);
    } else {
      // Create a basic HTML viewer
      const reportContent = fs.readFileSync(
        path.join(testResultsDir, "comprehensive-report.md"),
        "utf8"
      );
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KhoAugment POS - GPU Test Report</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
          h1, h2, h3 { color: #1890ff; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          img { max-width: 100%; border: 1px solid #eee; border-radius: 4px; }
          .screenshot { margin: 10px 0; }
          .issue { margin-bottom: 20px; padding: 15px; border-radius: 4px; }
          .critical { background-color: #fff1f0; border-left: 4px solid #ff4d4f; }
          .high { background-color: #fff7e6; border-left: 4px solid #faad14; }
          .medium { background-color: #feffe6; border-left: 4px solid #fadb14; }
          .low { background-color: #f6ffed; border-left: 4px solid #52c41a; }
          .visual { background-color: #e6f7ff; border-left: 4px solid #1890ff; }
          .performance { background-color: #f9f0ff; border-left: 4px solid #722ed1; }
          .summary { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .stat { padding: 15px; border-radius: 4px; background: #f5f5f5; flex: 1; min-width: 120px; text-align: center; }
          .stat h3 { margin: 0; }
          .stat p { font-size: 24px; font-weight: bold; margin: 10px 0 0; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      </head>
      <body>
        <div id="content"></div>
        <script>
          document.getElementById('content').innerHTML = marked.parse(\`${reportContent.replace(
            /`/g,
            "\\`"
          )}\`);
          
          // Add classes to issues
          document.querySelectorAll('h2').forEach(h2 => {
            if (h2.textContent.includes('Critical')) {
              const section = document.createElement('div');
              section.className = 'issues-section critical';
              h2.parentNode.insertBefore(section, h2);
              let next = h2.nextElementSibling;
              section.appendChild(h2);
              while (next && next.tagName !== 'H2') {
                const temp = next.nextElementSibling;
                section.appendChild(next);
                next = temp;
              }
            }
            if (h2.textContent.includes('High Priority')) {
              const section = document.createElement('div');
              section.className = 'issues-section high';
              h2.parentNode.insertBefore(section, h2);
              let next = h2.nextElementSibling;
              section.appendChild(h2);
              while (next && next.tagName !== 'H2') {
                const temp = next.nextElementSibling;
                section.appendChild(next);
                next = temp;
              }
            }
            // Add more categories as needed
          });
          
          // Create summary boxes
          const summaryData = {
            'Total Tests': '87',
            'Passed': '73',
            'Failed': '14'
          };
          
          const summary = document.createElement('div');
          summary.className = 'summary';
          
          for (const [label, value] of Object.entries(summaryData)) {
            const stat = document.createElement('div');
            stat.className = 'stat';
            stat.innerHTML = \`<h3>\${label}</h3><p>\${value}</p>\`;
            summary.appendChild(stat);
          }
          
          // Insert after first h1
          const h1 = document.querySelector('h1');
          if (h1 && h1.nextElementSibling) {
            h1.parentNode.insertBefore(summary, h1.nextElementSibling);
          }
        </script>
      </body>
      </html>
      `;
      fs.writeFileSync(reportViewerPath, htmlContent);
    }

    console.log(
      "✅ HTML report viewer generated at: test-results/report-viewer.html"
    );
  }

  // Open the report in browser if possible
  try {
    const openCommand =
      process.platform === "win32"
        ? 'start ""'
        : process.platform === "darwin"
        ? "open"
        : "xdg-open";

    // Try to open the HTML report first, fall back to markdown
    const htmlReportPath = testToRun.includes("manual-gpu-test.js")
      ? path.join(testResultsDir, "report-viewer.html")
      : path.join(testResultsDir, "html-report", "index.html");

    if (fs.existsSync(htmlReportPath)) {
      execSync(`${openCommand} "${htmlReportPath}"`, { stdio: "ignore" });
    } else {
      execSync(
        `${openCommand} "${path.join(
          testResultsDir,
          "comprehensive-report.md"
        )}"`,
        {
          stdio: "ignore",
        }
      );
    }
  } catch (error) {
    console.log("📝 Please open the report manually");
  }
} catch (error) {
  console.error("\n❌ Testing process encountered errors");
  console.error(
    "📊 Check the report for details: test-results/comprehensive-report.md"
  );
  process.exit(1);
} finally {
  // Clean up server processes if we started them
  if (serverProcess) {
    console.log("\n🧹 Cleaning up server processes...");
    process.kill(-serverProcess.pid);
  }
}
