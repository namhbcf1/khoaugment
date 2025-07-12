/**
 * KhoAugment POS System - Simple GPU Test
 * This script verifies GPU detection and basic functionality
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

console.log("🔍 KhoAugment POS System - Simple GPU Test");
console.log("==========================================");

// Create test results directory if it doesn't exist
const testResultsDir = path.join(__dirname, "../test-results");
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

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

console.log(
  `🖥️ System: ${systemInfo.platform} ${systemInfo.release} (${systemInfo.arch})`
);
console.log(`🧠 CPU: ${systemInfo.cpus} cores, RAM: ${systemInfo.totalMem}`);

// Check for NVIDIA GPU
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
  console.warn("Please ensure your NVIDIA drivers are properly installed");
}

// Check if we can access the application
console.log("\n🔍 Checking application availability...");
try {
  const http = require("http");
  const url = "http://localhost:5173";

  const req = http.get(url, (res) => {
    console.log(`✅ Application is accessible (status: ${res.statusCode})`);

    // Save test results
    const results = {
      timestamp: new Date().toISOString(),
      system: systemInfo,
      gpu: {
        info: gpuInfo,
        isNvidiaGTX1070,
      },
      application: {
        accessible: true,
        statusCode: res.statusCode,
      },
    };

    fs.writeFileSync(
      path.join(testResultsDir, "simple-test-results.json"),
      JSON.stringify(results, null, 2)
    );

    console.log("\n✅ Test completed successfully!");
    console.log(`📊 Results saved to: test-results/simple-test-results.json`);
  });

  req.on("error", (error) => {
    console.error(`❌ Application is not accessible: ${error.message}`);

    // Save test results
    const results = {
      timestamp: new Date().toISOString(),
      system: systemInfo,
      gpu: {
        info: gpuInfo,
        isNvidiaGTX1070,
      },
      application: {
        accessible: false,
        error: error.message,
      },
    };

    fs.writeFileSync(
      path.join(testResultsDir, "simple-test-results.json"),
      JSON.stringify(results, null, 2)
    );

    console.log("\n✅ Test completed with application access error!");
    console.log(`📊 Results saved to: test-results/simple-test-results.json`);
  });

  req.setTimeout(5000, () => {
    req.destroy();
    console.error("❌ Application access timed out after 5 seconds");

    // Save test results
    const results = {
      timestamp: new Date().toISOString(),
      system: systemInfo,
      gpu: {
        info: gpuInfo,
        isNvidiaGTX1070,
      },
      application: {
        accessible: false,
        error: "Timeout after 5 seconds",
      },
    };

    fs.writeFileSync(
      path.join(testResultsDir, "simple-test-results.json"),
      JSON.stringify(results, null, 2)
    );

    console.log("\n✅ Test completed with application access timeout!");
    console.log(`📊 Results saved to: test-results/simple-test-results.json`);
  });
} catch (error) {
  console.error(`❌ Error checking application: ${error.message}`);

  // Save test results
  const results = {
    timestamp: new Date().toISOString(),
    system: systemInfo,
    gpu: {
      info: gpuInfo,
      isNvidiaGTX1070,
    },
    application: {
      accessible: false,
      error: error.message,
    },
  };

  fs.writeFileSync(
    path.join(testResultsDir, "simple-test-results.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("\n✅ Test completed with error!");
  console.log(`📊 Results saved to: test-results/simple-test-results.json`);
}
