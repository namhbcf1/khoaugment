const fs = require("fs");
const path = require("path");

/**
 * KhoAugment POS System - Comprehensive Test Report Generator
 *
 * This script processes test results from GPU-accelerated testing
 * and generates a formatted markdown report with all issues categorized
 */

// Configuration
const CONFIG = {
  testResultsPath: path.join(__dirname, "../test-results/test-results.json"),
  reportOutputPath: path.join(
    __dirname,
    "../test-results/comprehensive-report.md"
  ),
  screenshotsDir: path.join(__dirname, "../test-results/screenshots"),
  baseUrl: process.env.BASE_URL || "https://khoaugment.pages.dev",
};

// Issue categories
const ISSUE_CATEGORIES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  VISUAL: "visual",
  PERFORMANCE: "performance",
};

// Main function to generate the report
async function generateReport() {
  console.log("📝 Generating comprehensive test report...");

  // Initialize report structure
  const report = {
    metadata: {
      testDate: new Date().toISOString(),
      systemInfo: await getSystemInfo(),
    },
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
    },
    issues: {
      [ISSUE_CATEGORIES.CRITICAL]: [],
      [ISSUE_CATEGORIES.HIGH]: [],
      [ISSUE_CATEGORIES.MEDIUM]: [],
      [ISSUE_CATEGORIES.LOW]: [],
      [ISSUE_CATEGORIES.VISUAL]: [],
      [ISSUE_CATEGORIES.PERFORMANCE]: [],
    },
  };

  // Process test results
  try {
    if (!fs.existsSync(CONFIG.testResultsPath)) {
      // If no test results file exists, we'll use any available data from screenshots and logs
      console.log(
        "⚠️ No test results file found. Generating report from available data..."
      );
      await processScreenshots(report);
    } else {
      const testResults = JSON.parse(
        fs.readFileSync(CONFIG.testResultsPath, "utf8")
      );
      await processTestResults(report, testResults);
    }
  } catch (error) {
    console.error(`❌ Error processing test results: ${error.message}`);
    // Continue with whatever data we have
  }

  // Write the report
  const reportContent = formatReport(report);
  fs.writeFileSync(CONFIG.reportOutputPath, reportContent);

  console.log(
    `✅ Report generated successfully at: ${CONFIG.reportOutputPath}`
  );
}

// Get system information
async function getSystemInfo() {
  const systemInfo = {
    gpu: "NVIDIA GTX 1070",
    os: process.platform,
    node: process.version,
  };

  // Try to get actual GPU info
  try {
    const { execSync } = require("child_process");
    if (process.platform !== "win32") {
      const gpuInfo = execSync(
        "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>/dev/null"
      )
        .toString()
        .trim();
      if (gpuInfo) {
        systemInfo.gpu = gpuInfo;
      }
    } else {
      // On Windows, try to get GPU info from Windows Management Instrumentation
      const gpuInfo = execSync("wmic path win32_VideoController get name")
        .toString()
        .trim()
        .split("\n")[1];
      if (gpuInfo) {
        systemInfo.gpu = gpuInfo.trim();
      }
    }
  } catch (error) {
    // If we can't get GPU info, use the default
  }

  return systemInfo;
}

// Process test results JSON
async function processTestResults(report, testResults) {
  // Extract summary information
  const results = testResults.suites ? testResults.suites : [testResults];

  // Process all results
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function processSpec(spec) {
    if (spec.specs) {
      spec.specs.forEach((subSpec) => processSpec(subSpec));
    }

    if (spec.tests) {
      spec.tests.forEach((test) => {
        totalTests++;
        if (test.status === "passed") {
          passedTests++;
        } else {
          failedTests++;

          // Extract issue information
          const issue = {
            component: test.title || "Unknown Component",
            description: test.error ? test.error.message : "Test failed",
            screenshot: test.attachments
              ? test.attachments.find((a) => a.name.includes("screenshot"))
                  ?.path
              : null,
          };

          // Categorize issue based on test title/error
          const lowerTitle = (test.title || "").toLowerCase();
          let category = ISSUE_CATEGORIES.MEDIUM; // Default

          if (
            lowerTitle.includes("critical") ||
            lowerTitle.includes("authentication") ||
            lowerTitle.includes("payment")
          ) {
            category = ISSUE_CATEGORIES.CRITICAL;
          } else if (
            lowerTitle.includes("high") ||
            lowerTitle.includes("api") ||
            lowerTitle.includes("data")
          ) {
            category = ISSUE_CATEGORIES.HIGH;
          } else if (
            lowerTitle.includes("visual") ||
            lowerTitle.includes("ui") ||
            lowerTitle.includes("display")
          ) {
            category = ISSUE_CATEGORIES.VISUAL;
          } else if (
            lowerTitle.includes("performance") ||
            lowerTitle.includes("slow") ||
            lowerTitle.includes("speed")
          ) {
            category = ISSUE_CATEGORIES.PERFORMANCE;
          } else if (lowerTitle.includes("low")) {
            category = ISSUE_CATEGORIES.LOW;
          }

          report.issues[category].push(issue);
        }
      });
    }
  }

  // Process all results
  results.forEach((result) => processSpec(result));

  // Update summary
  report.summary.totalTests = totalTests;
  report.summary.passedTests = passedTests;
  report.summary.failedTests = failedTests;
}

// Process screenshots if no test results are available
async function processScreenshots(report) {
  if (!fs.existsSync(CONFIG.screenshotsDir)) {
    return;
  }

  const screenshots = fs
    .readdirSync(CONFIG.screenshotsDir)
    .filter((file) => file.endsWith(".png"));

  report.summary.totalTests = screenshots.length;
  report.summary.failedTests = screenshots.length;

  // Process screenshot filenames to extract issue information
  screenshots.forEach((screenshot) => {
    // Try to extract component and issue type from filename
    const filenameParts = screenshot.replace(".png", "").split("-");

    let category = ISSUE_CATEGORIES.MEDIUM; // Default
    let component = "Unknown Component";
    let description = "Issue detected during testing";

    // Extract component and category from filename if possible
    if (filenameParts.includes("login") || filenameParts.includes("auth")) {
      component = "Authentication";
      category = ISSUE_CATEGORIES.CRITICAL;
    } else if (
      filenameParts.includes("payment") ||
      filenameParts.includes("checkout")
    ) {
      component = "Payment Processing";
      category = ISSUE_CATEGORIES.CRITICAL;
    } else if (
      filenameParts.includes("visual") ||
      filenameParts.includes("ui")
    ) {
      component = "User Interface";
      category = ISSUE_CATEGORIES.VISUAL;
    } else if (filenameParts.includes("performance")) {
      component = "Performance";
      category = ISSUE_CATEGORIES.PERFORMANCE;
    } else if (filenameParts.includes("mobile")) {
      component = "Mobile Interface";
    } else if (filenameParts.includes("admin")) {
      component = "Admin Interface";
    } else if (filenameParts.includes("pos")) {
      component = "POS Terminal";
    }

    // Create description from filename
    description = `Issue detected: ${filenameParts.join(" ")}`;

    report.issues[category].push({
      component,
      description,
      screenshot,
    });
  });
}

// Format the report as markdown
function formatReport(report) {
  const { metadata, summary, issues } = report;

  // Calculate total issues
  const totalIssues = Object.values(issues).reduce(
    (total, categoryIssues) => total + categoryIssues.length,
    0
  );

  let content = `# KhoAugment POS System - Comprehensive Test Report\n\n`;

  // Add metadata
  content += `## Test Information\n\n`;
  content += `- **Test Date:** ${new Date(
    metadata.testDate
  ).toLocaleString()}\n`;
  content += `- **GPU:** ${metadata.systemInfo.gpu}\n`;
  content += `- **OS:** ${metadata.systemInfo.os}\n`;
  content += `- **Node.js Version:** ${metadata.systemInfo.node}\n`;
  content += `- **Base URL:** ${CONFIG.baseUrl}\n\n`;

  // Add summary
  content += `## Summary\n\n`;
  content += `- **Total Tests:** ${summary.totalTests}\n`;
  content += `- **Passed:** ${summary.passedTests}\n`;
  content += `- **Failed:** ${summary.failedTests}\n`;
  content += `- **Total Issues Found:** ${totalIssues}\n\n`;
  content += `- Critical Issues: ${issues[ISSUE_CATEGORIES.CRITICAL].length}\n`;
  content += `- High Priority Issues: ${
    issues[ISSUE_CATEGORIES.HIGH].length
  }\n`;
  content += `- Medium Priority Issues: ${
    issues[ISSUE_CATEGORIES.MEDIUM].length
  }\n`;
  content += `- Low Priority Issues: ${issues[ISSUE_CATEGORIES.LOW].length}\n`;
  content += `- Visual Issues: ${issues[ISSUE_CATEGORIES.VISUAL].length}\n`;
  content += `- Performance Issues: ${
    issues[ISSUE_CATEGORIES.PERFORMANCE].length
  }\n\n`;

  // Add detailed issues by category
  const addIssuesSection = (title, category) => {
    const categoryIssues = issues[category];
    if (categoryIssues.length === 0) return "";

    let section = `## ${title} Issues\n\n`;

    categoryIssues.forEach((issue, index) => {
      section += `### ${index + 1}. ${issue.component}\n\n`;
      section += `**Description:** ${issue.description}\n\n`;

      if (issue.screenshot) {
        const screenshotPath = path
          .relative(
            path.dirname(CONFIG.reportOutputPath),
            path.join(CONFIG.screenshotsDir, issue.screenshot)
          )
          .replace(/\\/g, "/");

        section += `**Screenshot:** [View Screenshot](${screenshotPath})\n\n`;
      }
    });

    return section;
  };

  // Add each category section
  content += addIssuesSection("Critical", ISSUE_CATEGORIES.CRITICAL);
  content += addIssuesSection("High Priority", ISSUE_CATEGORIES.HIGH);
  content += addIssuesSection("Medium Priority", ISSUE_CATEGORIES.MEDIUM);
  content += addIssuesSection("Low Priority", ISSUE_CATEGORIES.LOW);
  content += addIssuesSection("Visual", ISSUE_CATEGORIES.VISUAL);
  content += addIssuesSection("Performance", ISSUE_CATEGORIES.PERFORMANCE);

  // Add recommendations section if issues found
  if (totalIssues > 0) {
    content += `## Recommendations\n\n`;

    if (issues[ISSUE_CATEGORIES.CRITICAL].length > 0) {
      content += `### Critical Issues\n\n`;
      content += `These issues should be addressed immediately as they affect core functionality:\n\n`;
      content += `- Fix authentication and payment processing issues\n`;
      content += `- Resolve data integrity problems\n`;
      content += `- Address security vulnerabilities\n\n`;
    }

    if (issues[ISSUE_CATEGORIES.PERFORMANCE].length > 0) {
      content += `### Performance Optimization\n\n`;
      content += `Performance issues impact user experience and should be addressed soon:\n\n`;
      content += `- Optimize slow loading pages and API endpoints\n`;
      content += `- Reduce JavaScript bundle sizes\n`;
      content += `- Implement better caching strategies\n\n`;
    }

    if (issues[ISSUE_CATEGORIES.VISUAL].length > 0) {
      content += `### UI Improvements\n\n`;
      content += `Visual issues affect user perception and should be fixed:\n\n`;
      content += `- Fix layout inconsistencies\n`;
      content += `- Address responsive design issues\n`;
      content += `- Ensure UI components follow design system\n\n`;
    }
  }

  return content;
}

// Execute the report generation
generateReport().catch((error) => {
  console.error(`❌ Error generating report: ${error.message}`);
  process.exit(1);
});
