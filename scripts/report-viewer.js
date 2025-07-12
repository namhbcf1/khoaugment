const http = require("http");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const open = require("open");

/**
 * KhoAugment POS System - Test Report Viewer
 *
 * A simple HTTP server that renders the comprehensive test report as HTML
 * with interactive features to view screenshots and organize findings
 */

// Configuration
const PORT = process.env.PORT || 8080;
const REPORT_PATH = path.join(
  __dirname,
  "../test-results/comprehensive-report.md"
);
const SCREENSHOTS_DIR = path.join(__dirname, "../test-results/screenshots");

// HTML template for the report viewer
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KhoAugment POS System - Test Report</title>
    <style>
        :root {
            --primary-color: #1890ff;
            --critical-color: #f5222d;
            --high-color: #fa8c16;
            --medium-color: #faad14;
            --low-color: #52c41a;
            --visual-color: #722ed1;
            --performance-color: #eb2f96;
            --bg-color: #f0f2f5;
            --card-bg: #fff;
            --text-color: #333;
            --border-color: #e8e8e8;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        header h1 {
            margin: 0;
        }
        
        .summary-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .card {
            background-color: var(--card-bg);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
            padding: 20px;
            flex: 1;
            min-width: 200px;
        }
        
        .card h3 {
            margin-top: 0;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 10px;
        }
        
        .issue-section {
            background-color: var(--card-bg);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .issue-section h2 {
            margin-top: 0;
        }
        
        .issue-item {
            border-left: 4px solid var(--primary-color);
            padding: 10px 15px;
            margin-bottom: 20px;
            background-color: rgba(24, 144, 255, 0.05);
        }
        
        .issue-item.critical {
            border-left-color: var(--critical-color);
            background-color: rgba(245, 34, 45, 0.05);
        }
        
        .issue-item.high {
            border-left-color: var(--high-color);
            background-color: rgba(250, 140, 22, 0.05);
        }
        
        .issue-item.medium {
            border-left-color: var(--medium-color);
            background-color: rgba(250, 173, 20, 0.05);
        }
        
        .issue-item.low {
            border-left-color: var(--low-color);
            background-color: rgba(82, 196, 26, 0.05);
        }
        
        .issue-item.visual {
            border-left-color: var(--visual-color);
            background-color: rgba(114, 46, 209, 0.05);
        }
        
        .issue-item.performance {
            border-left-color: var(--performance-color);
            background-color: rgba(235, 47, 150, 0.05);
        }
        
        .screenshot {
            max-width: 100%;
            cursor: zoom-in;
            border: 1px solid var(--border-color);
            margin-top: 10px;
        }
        
        .screenshot-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            align-items: center;
            justify-content: center;
        }
        
        .screenshot-modal-content {
            max-width: 90%;
            max-height: 90%;
        }
        
        .close-modal {
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 30px;
            color: #fff;
            cursor: pointer;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            margin-right: 10px;
        }
        
        .badge.critical {
            background-color: var(--critical-color);
        }
        
        .badge.high {
            background-color: var(--high-color);
        }
        
        .badge.medium {
            background-color: var(--medium-color);
        }
        
        .badge.low {
            background-color: var(--low-color);
        }
        
        .badge.visual {
            background-color: var(--visual-color);
        }
        
        .badge.performance {
            background-color: var(--performance-color);
        }
        
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        
        .tab.active {
            border-bottom-color: var(--primary-color);
            font-weight: bold;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .filter-bar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .filter-button {
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            cursor: pointer;
            background-color: white;
            font-size: 14px;
        }
        
        .filter-button.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        @media (max-width: 768px) {
            .summary-cards {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>KhoAugment POS System - GPU Test Report</h1>
        </div>
    </header>
    
    <div class="container">
        <div class="tabs">
            <div class="tab active" data-tab="summary">Summary</div>
            <div class="tab" data-tab="issues">Issues</div>
            <div class="tab" data-tab="recommendations">Recommendations</div>
        </div>
        
        <div class="tab-content active" id="summary">
            <!-- Summary will be inserted here -->
        </div>
        
        <div class="tab-content" id="issues">
            <div class="filter-bar">
                <button class="filter-button active" data-filter="all">All Issues</button>
                <button class="filter-button" data-filter="critical">Critical</button>
                <button class="filter-button" data-filter="high">High</button>
                <button class="filter-button" data-filter="medium">Medium</button>
                <button class="filter-button" data-filter="low">Low</button>
                <button class="filter-button" data-filter="visual">Visual</button>
                <button class="filter-button" data-filter="performance">Performance</button>
            </div>
            <!-- Issues will be inserted here -->
        </div>
        
        <div class="tab-content" id="recommendations">
            <!-- Recommendations will be inserted here -->
        </div>
    </div>
    
    <div class="screenshot-modal">
        <span class="close-modal">&times;</span>
        <img class="screenshot-modal-content" src="" alt="Screenshot">
    </div>
    
    <script>
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
        
        // Issue filtering
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                const filter = button.dataset.filter;
                document.querySelectorAll('.issue-item').forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
        // Screenshot modal
        document.querySelectorAll('.screenshot').forEach(img => {
            img.addEventListener('click', () => {
                const modal = document.querySelector('.screenshot-modal');
                const modalImg = document.querySelector('.screenshot-modal-content');
                modal.style.display = 'flex';
                modalImg.src = img.src;
            });
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.querySelector('.screenshot-modal').style.display = 'none';
        });
        
        document.querySelector('.screenshot-modal').addEventListener('click', (e) => {
            if (e.target === document.querySelector('.screenshot-modal')) {
                document.querySelector('.screenshot-modal').style.display = 'none';
            }
        });
    </script>
</body>
</html>
`;

// Check if the report file exists
if (!fs.existsSync(REPORT_PATH)) {
  console.error(`❌ Report file not found at ${REPORT_PATH}`);
  console.error("Please run the tests first to generate the report.");
  process.exit(1);
}

// Create an HTTP server
const server = http.createServer((req, res) => {
  const url = req.url;

  // Serve the main HTML page
  if (url === "/" || url === "/index.html") {
    try {
      const reportContent = fs.readFileSync(REPORT_PATH, "utf8");
      const htmlContent = processReportToHtml(reportContent);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Error loading report: ${error.message}`);
    }
  }
  // Serve screenshot images
  else if (url.startsWith("/screenshots/") && url.match(/\.(png|jpg|jpeg)$/i)) {
    const imagePath = path.join(__dirname, "..", "test-results", url);

    if (fs.existsSync(imagePath)) {
      const contentType = url.endsWith(".png") ? "image/png" : "image/jpeg";
      const image = fs.readFileSync(imagePath);

      res.writeHead(200, { "Content-Type": contentType });
      res.end(image);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Screenshot not found");
    }
  }
  // Handle all other requests as 404
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

// Process the markdown report to HTML
function processReportToHtml(markdown) {
  let html = HTML_TEMPLATE;

  // Parse the report using marked
  const reportHtml = marked.parse(markdown);

  // Extract sections for our tabs
  const summaryMatch = reportHtml.match(
    /<h2 id="summary">Summary<\/h2>([\s\S]*?)(?:<h2|$)/i
  );
  const summary = summaryMatch ? summaryMatch[1] : "";

  // Format summary section with cards
  let summaryHtml = '<div class="summary-cards">';

  // Extract test information
  const testInfoMatch = reportHtml.match(
    /<h2 id="test-information">Test Information<\/h2>([\s\S]*?)(?:<h2|$)/i
  );
  if (testInfoMatch) {
    summaryHtml += `
      <div class="card">
        <h3>Test Information</h3>
        ${testInfoMatch[1]}
      </div>
    `;
  }

  // Extract metrics from summary
  if (summaryMatch) {
    const testCountMatch = summary.match(/Total Tests: (\d+)/);
    const passedMatch = summary.match(/Passed: (\d+)/);
    const failedMatch = summary.match(/Failed: (\d+)/);
    const issuesMatch = summary.match(/Total Issues Found: (\d+)/);

    if (testCountMatch || passedMatch || failedMatch || issuesMatch) {
      summaryHtml += `
        <div class="card">
          <h3>Test Results</h3>
          <ul>
            ${
              testCountMatch ? `<li>Total Tests: ${testCountMatch[1]}</li>` : ""
            }
            ${passedMatch ? `<li>Passed: ${passedMatch[1]}</li>` : ""}
            ${failedMatch ? `<li>Failed: ${failedMatch[1]}</li>` : ""}
            ${
              issuesMatch
                ? `<li>Total Issues Found: ${issuesMatch[1]}</li>`
                : ""
            }
          </ul>
        </div>
      `;
    }
  }

  // Extract issue counts
  const criticalMatch = reportHtml.match(/Critical Issues: (\d+)/);
  const highMatch = reportHtml.match(/High Priority Issues: (\d+)/);
  const mediumMatch = reportHtml.match(/Medium Priority Issues: (\d+)/);
  const lowMatch = reportHtml.match(/Low Priority Issues: (\d+)/);
  const visualMatch = reportHtml.match(/Visual Issues: (\d+)/);
  const performanceMatch = reportHtml.match(/Performance Issues: (\d+)/);

  if (
    criticalMatch ||
    highMatch ||
    mediumMatch ||
    lowMatch ||
    visualMatch ||
    performanceMatch
  ) {
    summaryHtml += `
      <div class="card">
        <h3>Issues by Severity</h3>
        <ul>
          ${
            criticalMatch
              ? `<li><span class="badge critical">Critical</span> ${criticalMatch[1]}</li>`
              : ""
          }
          ${
            highMatch
              ? `<li><span class="badge high">High</span> ${highMatch[1]}</li>`
              : ""
          }
          ${
            mediumMatch
              ? `<li><span class="badge medium">Medium</span> ${mediumMatch[1]}</li>`
              : ""
          }
          ${
            lowMatch
              ? `<li><span class="badge low">Low</span> ${lowMatch[1]}</li>`
              : ""
          }
          ${
            visualMatch
              ? `<li><span class="badge visual">Visual</span> ${visualMatch[1]}</li>`
              : ""
          }
          ${
            performanceMatch
              ? `<li><span class="badge performance">Performance</span> ${performanceMatch[1]}</li>`
              : ""
          }
        </ul>
      </div>
    `;
  }

  summaryHtml += "</div>";

  // Process issue sections
  let issuesHtml = "";

  // Function to extract and process each issue section
  function processIssueSection(title, className) {
    const sectionMatch = reportHtml.match(
      new RegExp(
        `<h2 id="${title
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          )}-issues">${title} Issues<\/h2>([\s\S]*?)(?:<h2|$)`,
        "i"
      )
    );

    if (sectionMatch && sectionMatch[1]) {
      // Extract individual issues from the section
      const issuePattern =
        /<h3 id=["']?.*?["']?>(.*?)<\/h3>([\s\S]*?)(?:<h3|$)/gi;
      let issueMatch;
      let sectionIssues = "";

      while ((issueMatch = issuePattern.exec(sectionMatch[1])) !== null) {
        const issueTitle = issueMatch[1];
        let issueContent = issueMatch[2];

        // Process screenshots to make them interactive
        issueContent = issueContent.replace(
          /<a href="([^"]+)">View Screenshot<\/a>/g,
          '<img class="screenshot" src="$1" alt="Screenshot" />'
        );

        sectionIssues += `
          <div class="issue-item ${className}">
            <h3><span class="badge ${className}">${title}</span>${issueTitle}</h3>
            ${issueContent}
          </div>
        `;
      }

      if (sectionIssues) {
        issuesHtml += `
          <div class="issue-section">
            <h2>${title} Issues</h2>
            ${sectionIssues}
          </div>
        `;
      }
    }
  }

  // Process each category of issues
  processIssueSection("Critical", "critical");
  processIssueSection("High Priority", "high");
  processIssueSection("Medium Priority", "medium");
  processIssueSection("Low Priority", "low");
  processIssueSection("Visual", "visual");
  processIssueSection("Performance", "performance");

  // Extract recommendations section
  const recommendationsMatch = reportHtml.match(
    /<h2 id="recommendations">Recommendations<\/h2>([\s\S]*?)(?:<h2|$)/i
  );
  const recommendations = recommendationsMatch ? recommendationsMatch[1] : "";

  // Insert all sections into the HTML template
  html = html.replace("<!-- Summary will be inserted here -->", summaryHtml);
  html = html.replace("<!-- Issues will be inserted here -->", issuesHtml);
  html = html.replace(
    "<!-- Recommendations will be inserted here -->",
    recommendations
  );

  // Fix screenshot links to be relative to the server
  html = html.replace(/src="\.\.\/screenshots\//g, 'src="/screenshots/');

  return html;
}

// Start the server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 Report viewer started at: ${url}`);
  console.log("Press Ctrl+C to stop\n");

  // Try to open the browser
  try {
    open(url);
  } catch (err) {
    console.log(
      "Failed to open browser automatically. Please open the URL manually."
    );
  }
});
