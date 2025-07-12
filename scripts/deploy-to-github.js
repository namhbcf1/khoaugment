/**
 * Enhanced GitHub Deployment Script for KhoAugment POS
 * This script manages GitHub repository setup, workflows, and integration with Cloudflare
 *
 * Features:
 * - GitHub repository creation and configuration
 * - Automated workflow file generation
 * - Branch protection rules setup
 * - Issue templates and PR templates
 * - Integration with Cloudflare deployment
 * - Comprehensive error handling and validation
 *
 * @author KhoAugment POS Team
 * @version 2.1.0
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const https = require("https");
const { deploy: deployToCloudflare } = require("./deploy-to-cloudflare");

// Configuration - would normally load from env or config file
const CONFIG = {
  github: {
    owner: process.env.GITHUB_OWNER || "khoaugment",
    repo: process.env.GITHUB_REPO || "pos-system",
    token: process.env.GITHUB_TOKEN,
    apiUrl: "https://api.github.com",
    environments: ["dev", "staging", "production"],
    enableActions: true,
    protectMainBranch: true,
    requiredReviewers: 1,
    createWorkflows: true,
    setupSecrets: true,
  },
  deployment: {
    triggerCloudflareDeployment: true,
    setupDependabot: true,
    configureCORS: true,
    setupCodeowners: true,
  },
  logLevel: "verbose", // 'minimal', 'standard', 'verbose', 'debug'
};

// Global variables
const workflowsDir = path.join(__dirname, "../.github/workflows");
const templatesDir = path.join(__dirname, "../.github/ISSUE_TEMPLATE");
const rootDir = path.join(__dirname, "../");

// Logger with different levels
const logger = {
  minimal: (message) => {
    if (["minimal", "standard", "verbose", "debug"].includes(CONFIG.logLevel)) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  },
  standard: (message) => {
    if (["standard", "verbose", "debug"].includes(CONFIG.logLevel)) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  },
  verbose: (message) => {
    if (["verbose", "debug"].includes(CONFIG.logLevel)) {
      console.log(`[${new Date().toISOString()}] 🔍 ${message}`);
    }
  },
  debug: (message) => {
    if (["debug"].includes(CONFIG.logLevel)) {
      console.log(`[${new Date().toISOString()}] 🐞 DEBUG: ${message}`);
    }
  },
  error: (message) => {
    console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`);
  },
  success: (message) => {
    console.log(`[${new Date().toISOString()}] ✅ ${message}`);
  },
  warning: (message) => {
    console.warn(`[${new Date().toISOString()}] ⚠️ WARNING: ${message}`);
  },
};

/**
 * Executes a command with proper error handling
 * @param {string} command - Command to execute
 * @param {boolean} silent - Whether to suppress output
 * @returns {Promise<string>} Command output
 */
async function executeCommand(command, silent = false) {
  return new Promise((resolve, reject) => {
    if (!silent) logger.verbose(`Executing: ${command}`);

    const proc = spawn(command.split(" ")[0], command.split(" ").slice(1), {
      shell: true,
      stdio: silent ? "pipe" : "inherit",
    });

    let stdout = "";
    let stderr = "";

    if (proc.stdout) {
      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Command error: ${err.message}`));
    });
  });
}

/**
 * Makes an authenticated request to GitHub API
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @returns {Promise<object>} Response data
 */
async function githubApiRequest(endpoint, method = "GET", data = null) {
  if (!CONFIG.github.token) {
    throw new Error(
      "GitHub token not provided. Set GITHUB_TOKEN environment variable."
    );
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
      method: method,
      headers: {
        "User-Agent": "KhoAugment-Deployment-Script",
        Authorization: `token ${CONFIG.github.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    };

    if (method === "GET") {
      logger.debug(`Making GitHub API request: ${method} ${endpoint}`);
    } else {
      logger.verbose(`Making GitHub API request: ${method} ${endpoint}`);
    }

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(responseData);
            resolve(jsonData);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          let errorMessage = `GitHub API request failed with status ${res.statusCode}`;
          try {
            const errorData = JSON.parse(responseData);
            errorMessage = `${errorMessage}: ${JSON.stringify(errorData)}`;
          } catch (e) {
            errorMessage = `${errorMessage}: ${responseData}`;
          }
          reject(new Error(errorMessage));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Checks if the repository exists and creates it if not
 * @returns {Promise<boolean>} Success status
 */
async function checkOrCreateRepository() {
  try {
    logger.standard(
      `Checking if repository ${CONFIG.github.owner}/${CONFIG.github.repo} exists...`
    );

    try {
      await githubApiRequest(
        `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}`
      );
      logger.success(
        `Repository ${CONFIG.github.owner}/${CONFIG.github.repo} exists`
      );
      return true;
    } catch (error) {
      if (error.message.includes("404")) {
        logger.warning(`Repository does not exist, creating it...`);

        const createData = {
          name: CONFIG.github.repo,
          description: "KhoAugment POS System - Optimized for Cloudflare",
          private: true,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
        };

        await githubApiRequest("/user/repos", "POST", createData);
        logger.success(
          `Repository ${CONFIG.github.owner}/${CONFIG.github.repo} created successfully`
        );

        // Initialize with current code
        try {
          await executeCommand("git init", true);
          await executeCommand(
            `git remote add origin https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}.git`,
            true
          );
          await executeCommand("git add .", true);
          await executeCommand('git commit -m "Initial commit"', true);
          await executeCommand("git push -u origin main", true);
          logger.success("Repository initialized with current code");
        } catch (gitError) {
          logger.error(`Failed to initialize repository: ${gitError.message}`);
          logger.error("Please initialize the repository manually");
        }

        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Failed to check/create repository: ${error.message}`);
    return false;
  }
}

/**
 * Creates GitHub workflow files
 * @returns {Promise<boolean>} Success status
 */
async function setupGitHubWorkflows() {
  try {
    if (!CONFIG.github.createWorkflows) {
      logger.verbose("Workflow creation disabled, skipping...");
      return true;
    }

    logger.standard("Setting up GitHub workflow files...");

    // Ensure workflows directory exists
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // Create CI workflow
    const ciWorkflow = `name: CI

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main, develop, staging ]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test
      
      - name: Run backend tests
        run: |
          cd backend
          npm run test

  lint:
    name: Lint
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
      
      - name: Lint frontend
        run: |
          cd frontend
          npm run lint
      
      - name: Lint backend
        run: |
          cd backend
          npm run lint
`;

    // Create CD workflow for each environment
    const deployWorkflow = `name: Deploy to Cloudflare

on:
  push:
    branches:
      - main
      - staging
      - develop
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'dev'
        type: choice
        options:
          - dev
          - staging
          - production

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          cd ../backend
          npm ci
          npm install -g wrangler
      
      - name: Determine environment
        id: env
        run: |
          if [ "\${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "ENVIRONMENT=\${{ github.event.inputs.environment }}" >> $GITHUB_ENV
          elif [ "\${{ github.ref }}" == "refs/heads/main" ]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
          elif [ "\${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=dev" >> $GITHUB_ENV
          fi
      
      - name: Deploy Backend to Cloudflare Workers
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd backend
          wrangler deploy --env \${{ env.ENVIRONMENT }}
      
      - name: Deploy Frontend to Cloudflare Pages
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd frontend
          npm run build
          wrangler pages deploy dist --project-name=khoaugment-\${{ env.ENVIRONMENT }} --env=\${{ env.ENVIRONMENT }}
      
      - name: Run DB Migrations
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd backend
          wrangler d1 migrations apply khoaugment-\${{ env.ENVIRONMENT }} --env \${{ env.ENVIRONMENT }}
      
      - name: Deploy Assets to R2
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          node scripts/deploy-assets.js \${{ env.ENVIRONMENT }}
`;

    // Write workflow files
    fs.writeFileSync(path.join(workflowsDir, "ci.yml"), ciWorkflow);
    fs.writeFileSync(path.join(workflowsDir, "deploy.yml"), deployWorkflow);

    logger.success("GitHub workflow files created successfully");

    // Deploy assets script for R2
    const deployAssetsScript = `/**
 * Asset Deployment Script for R2
 * Used by GitHub Actions to deploy assets to Cloudflare R2
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const environment = process.argv[2] || 'dev';
const bucketNames = {
  dev: 'khopos-assets-dev',
  staging: 'khopos-assets-staging',
  production: 'khopos-assets'
};

const bucketName = bucketNames[environment];
const assetsDir = path.join(__dirname, '../frontend/public');

if (!bucketName) {
  console.error(\`Unknown environment: \${environment}\`);
  process.exit(1);
}

console.log(\`Deploying assets to R2 bucket \${bucketName}...\`);

// Find all assets recursively
function getFilesRecursively(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Get content type
function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}

try {
  const assetFiles = getFilesRecursively(assetsDir);
  console.log(\`Found \${assetFiles.length} assets to upload\`);
  
  for (const file of assetFiles) {
    const relativePath = path.relative(assetsDir, file);
    const contentType = getContentType(file);
    
    console.log(\`Uploading \${relativePath}...\`);
    execSync(\`wrangler r2 object put \${bucketName}/\${relativePath} --file=\${file} --content-type="\${contentType}" --env \${environment}\`);
  }
  
  console.log('Asset deployment completed successfully');
} catch (error) {
  console.error(\`Error deploying assets: \${error.message}\`);
  process.exit(1);
}`;

    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, "../scripts");
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Write deploy-assets.js script
    fs.writeFileSync(
      path.join(scriptsDir, "deploy-assets.js"),
      deployAssetsScript
    );
    logger.success("Asset deployment script created");

    return true;
  } catch (error) {
    logger.error(`Failed to setup GitHub workflows: ${error.message}`);
    return false;
  }
}

/**
 * Creates issue templates
 * @returns {Promise<boolean>} Success status
 */
async function setupIssueTemplates() {
  try {
    logger.standard("Setting up issue templates...");

    // Ensure templates directory exists
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Create bug report template
    const bugTemplate = `---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Device: [e.g. Desktop, iPhone 12]

**Vietnamese-specific Issues (if applicable):**
- Does this issue involve Vietnamese characters or language?
- Any issues with Vietnamese currency formatting?

**Additional context**
Add any other context about the problem here.
`;

    // Create feature request template
    const featureTemplate = `---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Cloudflare Service Requirements**
- Does this feature require specific Cloudflare services?
- Any limits or constraints to consider (free tier limitations)?

**Vietnamese Market Considerations**
- Any special requirements for Vietnamese users?
- Language or currency formatting needs?

**Additional context**
Add any other context or screenshots about the feature request here.
`;

    // Write template files
    fs.writeFileSync(path.join(templatesDir, "bug_report.md"), bugTemplate);
    fs.writeFileSync(
      path.join(templatesDir, "feature_request.md"),
      featureTemplate
    );

    // Create config.yml file
    const configYml = `blank_issues_enabled: false
contact_links:
  - name: KhoAugment POS Support
    url: https://khoaugment.com/support
    about: Please contact support for account-related issues
`;
    fs.writeFileSync(path.join(templatesDir, "config.yml"), configYml);

    // Create PR template
    const prTemplate = `## Description
<!--- Describe your changes in detail -->

## Related Issue
<!--- If fixing a bug, there should be an issue describing it with steps to reproduce -->
<!--- Please link to the issue here: -->

## Motivation and Context
<!--- Why is this change required? What problem does it solve? -->

## How Has This Been Tested?
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, and the tests you ran to -->
<!--- see how your change affects other areas of the code, etc. -->

## Screenshots (if appropriate):

## Types of changes
<!--- What types of changes does your code introduce? Put an \`x\` in all the boxes that apply: -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement

## Checklist:
<!--- Go over all the following points, and put an \`x\` in all the boxes that apply. -->
<!--- If you're unsure about any of these, don't hesitate to ask. We're here to help! -->
- [ ] My code follows the code style of this project.
- [ ] I have updated the documentation accordingly.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.
- [ ] My changes generate no new warnings.
- [ ] I have checked my code and corrected any misspellings.
- [ ] I have checked that my changes work correctly with Vietnamese characters and currency.
`;
    fs.writeFileSync(
      path.join(rootDir, ".github", "PULL_REQUEST_TEMPLATE.md"),
      prTemplate
    );

    logger.success("Issue and PR templates created successfully");
    return true;
  } catch (error) {
    logger.error(`Failed to setup issue templates: ${error.message}`);
    return false;
  }
}

/**
 * Sets up branch protection for main branch
 * @returns {Promise<boolean>} Success status
 */
async function setupBranchProtection() {
  try {
    if (!CONFIG.github.protectMainBranch) {
      logger.verbose("Branch protection disabled, skipping...");
      return true;
    }

    logger.standard("Setting up branch protection for main branch...");

    const protectionData = {
      required_status_checks: {
        strict: true,
        contexts: ["test", "lint"],
      },
      enforce_admins: false,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: CONFIG.github.requiredReviewers,
      },
      restrictions: null,
    };

    await githubApiRequest(
      `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/branches/main/protection`,
      "PUT",
      protectionData
    );

    logger.success("Branch protection configured successfully");
    return true;
  } catch (error) {
    logger.error(`Failed to setup branch protection: ${error.message}`);
    return false;
  }
}

/**
 * Sets up GitHub repository secrets
 * @returns {Promise<boolean>} Success status
 */
async function setupRepositorySecrets() {
  try {
    if (!CONFIG.github.setupSecrets) {
      logger.verbose("Repository secrets setup disabled, skipping...");
      return true;
    }

    logger.standard("Setting up repository secrets...");

    // First get the public key for the repository
    const publicKeyResponse = await githubApiRequest(
      `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/actions/secrets/public-key`
    );
    const { key, key_id } = publicKeyResponse;

    // List of secrets to create
    const secrets = [
      {
        name: "CLOUDFLARE_API_TOKEN",
        value: process.env.CF_API_KEY_PROD || "REPLACE_WITH_ACTUAL_TOKEN",
      },
      {
        name: "CLOUDFLARE_ACCOUNT_ID",
        value: process.env.CF_ACCOUNT_ID || "REPLACE_WITH_ACTUAL_ACCOUNT_ID",
      },
    ];

    // Helper function to encrypt a secret using the public key
    function encryptSecret(value, publicKey) {
      // This is a simplified version. In a real implementation, you would use
      // sodium-native or a similar library to perform the encryption
      // For this example, we'll use a placeholder
      const encodedValue = Buffer.from(value).toString("base64");
      return encodedValue;
    }

    // Create each secret
    for (const secret of secrets) {
      const encryptedValue = encryptSecret(secret.value, key);

      await githubApiRequest(
        `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/actions/secrets/${secret.name}`,
        "PUT",
        {
          encrypted_value: encryptedValue,
          key_id,
        }
      );

      logger.verbose(`Secret ${secret.name} created successfully`);
    }

    logger.success("Repository secrets set up successfully");

    if (secrets.some((s) => s.value.includes("REPLACE_WITH_ACTUAL"))) {
      logger.warning(
        "Some secrets contain placeholder values. Please update them with actual values."
      );
    }

    return true;
  } catch (error) {
    logger.error(`Failed to setup repository secrets: ${error.message}`);
    return false;
  }
}

/**
 * Sets up CODEOWNERS file
 * @returns {Promise<boolean>} Success status
 */
async function setupCodeowners() {
  try {
    if (!CONFIG.deployment.setupCodeowners) {
      logger.verbose("CODEOWNERS setup disabled, skipping...");
      return true;
    }

    logger.standard("Setting up CODEOWNERS file...");

    // Ensure .github directory exists
    const githubDir = path.join(rootDir, ".github");
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }

    // Create CODEOWNERS file
    const codeownersContent = `# KhoAugment POS System CODEOWNERS

# Default owners for everything
*       @${CONFIG.github.owner}

# Backend specific files
/backend/         @${CONFIG.github.owner}
*.js             @${CONFIG.github.owner}
*.ts             @${CONFIG.github.owner}
wrangler.toml    @${CONFIG.github.owner}

# Frontend specific files
/frontend/       @${CONFIG.github.owner}
*.jsx            @${CONFIG.github.owner}
*.tsx            @${CONFIG.github.owner}

# Database files
/backend/migrations/    @${CONFIG.github.owner}
*.sql                  @${CONFIG.github.owner}

# Infrastructure and configuration
/.github/        @${CONFIG.github.owner}
/scripts/        @${CONFIG.github.owner}
`;

    fs.writeFileSync(path.join(githubDir, "CODEOWNERS"), codeownersContent);

    logger.success("CODEOWNERS file created successfully");
    return true;
  } catch (error) {
    logger.error(`Failed to setup CODEOWNERS: ${error.message}`);
    return false;
  }
}

/**
 * Sets up Dependabot configuration
 * @returns {Promise<boolean>} Success status
 */
async function setupDependabot() {
  try {
    if (!CONFIG.deployment.setupDependabot) {
      logger.verbose("Dependabot setup disabled, skipping...");
      return true;
    }

    logger.standard("Setting up Dependabot configuration...");

    // Ensure .github directory exists
    const githubDir = path.join(rootDir, ".github");
    if (!fs.existsSync(githubDir)) {
      fs.mkdirSync(githubDir, { recursive: true });
    }

    // Create Dependabot config
    const dependabotConfig = `version: 2
updates:
  # Frontend dependencies
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "frontend"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-patch"]

  # Backend dependencies
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "backend"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-patch"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "ci"
`;

    // Write dependabot config
    fs.writeFileSync(path.join(githubDir, "dependabot.yml"), dependabotConfig);

    logger.success("Dependabot configuration created successfully");
    return true;
  } catch (error) {
    logger.error(`Failed to setup Dependabot: ${error.message}`);
    return false;
  }
}

/**
 * Sets up CORS configuration for Cloudflare
 * @returns {Promise<boolean>} Success status
 */
async function setupCORS() {
  try {
    if (!CONFIG.deployment.configureCORS) {
      logger.verbose("CORS configuration disabled, skipping...");
      return true;
    }

    logger.standard("Setting up CORS configuration...");

    // Create _headers file for frontend
    const frontendHeadersPath = path.join(rootDir, "frontend", "_headers");
    const headersContent = `# CORS headers for KhoAugment POS System
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Max-Age: 86400
`;
    fs.writeFileSync(frontendHeadersPath, headersContent);

    // Ensure CORS middleware is used in backend
    const backendIndex = path.join(rootDir, "backend", "src", "index.js");
    if (fs.existsSync(backendIndex)) {
      let indexContent = fs.readFileSync(backendIndex, "utf-8");

      if (!indexContent.includes("cors")) {
        logger.warning("CORS middleware not found in backend code");
        logger.warning(
          "Please ensure CORS is properly configured in your backend"
        );
      } else {
        logger.verbose("CORS middleware found in backend code");
      }
    }

    logger.success("CORS configuration completed");
    return true;
  } catch (error) {
    logger.error(`Failed to setup CORS configuration: ${error.message}`);
    return false;
  }
}

/**
 * Main deployment function
 * @returns {Promise<boolean>} Deployment success status
 */
async function deployToGitHub() {
  try {
    logger.minimal("Starting GitHub repository setup and deployment...");

    // Check or create repository
    if (!(await checkOrCreateRepository())) {
      return false;
    }

    // Set up GitHub workflows
    if (!(await setupGitHubWorkflows())) {
      logger.warning("Failed to setup GitHub workflows, continuing...");
    }

    // Set up issue templates
    if (!(await setupIssueTemplates())) {
      logger.warning("Failed to setup issue templates, continuing...");
    }

    // Set up branch protection
    if (!(await setupBranchProtection())) {
      logger.warning("Failed to setup branch protection, continuing...");
    }

    // Set up repository secrets
    if (!(await setupRepositorySecrets())) {
      logger.warning("Failed to setup repository secrets, continuing...");
    }

    // Set up CODEOWNERS file
    if (!(await setupCodeowners())) {
      logger.warning("Failed to setup CODEOWNERS file, continuing...");
    }

    // Set up Dependabot
    if (!(await setupDependabot())) {
      logger.warning("Failed to setup Dependabot, continuing...");
    }

    // Set up CORS configuration
    if (!(await setupCORS())) {
      logger.warning("Failed to setup CORS configuration, continuing...");
    }

    // Commit changes if any
    try {
      await executeCommand("git add .github scripts frontend/_headers", true);
      await executeCommand(
        'git commit -m "Add GitHub workflows and configuration"',
        true
      );
      await executeCommand("git push origin main", true);
      logger.success("Changes committed and pushed to GitHub");
    } catch (error) {
      logger.warning(`Failed to commit changes: ${error.message}`);
      logger.warning("Please commit and push the changes manually");
    }

    // Trigger Cloudflare deployment if requested
    if (CONFIG.deployment.triggerCloudflareDeployment) {
      logger.standard("Triggering Cloudflare deployment...");

      try {
        await deployToCloudflare("dev");
        logger.success("Cloudflare deployment triggered successfully");
      } catch (error) {
        logger.error(
          `Failed to trigger Cloudflare deployment: ${error.message}`
        );
      }
    }

    logger.success(
      "GitHub repository setup and deployment completed successfully"
    );
    return true;
  } catch (error) {
    logger.error(`GitHub deployment failed: ${error.message}`);
    return false;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToGitHub()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      logger.error(`Unhandled error: ${error.message}`);
      process.exit(1);
    });
}

// Export for programmatic use
module.exports = {
  deployToGitHub,
  CONFIG,
};
