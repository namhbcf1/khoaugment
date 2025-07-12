/**
 * Enhanced Cloudflare Deployment Script for KhoAugment POS
 * This script handles complex deployment to Cloudflare Workers, D1, R2 and Pages
 *
 * Features:
 * - Multi-environment deployment (dev, staging, production)
 * - Comprehensive error handling with retries
 * - Performance metrics collection
 * - Built-in validation for Workers and Pages
 * - R2 asset optimization
 * - Database migration automation
 *
 * @author KhoAugment POS Team
 * @version 3.2.1
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const crypto = require("crypto");
const https = require("https");
const zlib = require("zlib");

// Configuration - would normally load from env or config file
const CONFIG = {
  environments: {
    dev: {
      workerName: "khoaugment-pos-dev",
      d1Database: "khoaugment-dev",
      r2Bucket: "khopos-assets-dev",
      pagesProject: "khoaugment-dev",
      domain: "dev.khoaugment.pages.dev",
      apiKey: process.env.CF_API_KEY_DEV,
      email: process.env.CF_EMAIL,
      accountId: process.env.CF_ACCOUNT_ID,
      deployBranch: "develop",
    },
    staging: {
      workerName: "khoaugment-pos-staging",
      d1Database: "khoaugment-staging",
      r2Bucket: "khopos-assets-staging",
      pagesProject: "khoaugment-staging",
      domain: "staging.khoaugment.pages.dev",
      apiKey: process.env.CF_API_KEY_STAGING,
      email: process.env.CF_EMAIL,
      accountId: process.env.CF_ACCOUNT_ID,
      deployBranch: "staging",
    },
    production: {
      workerName: "khoaugment-pos",
      d1Database: "khoaugment",
      r2Bucket: "khopos-assets",
      pagesProject: "khoaugment",
      domain: "khoaugment.pages.dev",
      apiKey: process.env.CF_API_KEY_PROD,
      email: process.env.CF_EMAIL,
      accountId: process.env.CF_ACCOUNT_ID,
      deployBranch: "main",
    },
  },
  backendDir: path.join(__dirname, "../backend"),
  frontendDir: path.join(__dirname, "../frontend"),
  maxRetries: 3,
  timeoutMs: 60000,
  validateDeployment: true,
  runMigrations: true,
  optimizeAssets: true,
  deployR2Assets: true,
  logLevel: "verbose", // 'minimal', 'standard', 'verbose', 'debug'
  metrics: {
    collect: true,
    sendToAnalytics: false,
    analyticsEndpoint: "https://analytics.khoaugment.com/deployment",
  },
};

// Global variables
let deploymentMetrics = {
  startTime: Date.now(),
  endTime: null,
  environment: "",
  success: false,
  workerDeployment: { success: false, duration: 0, errors: [] },
  d1Deployment: { success: false, duration: 0, errors: [] },
  r2Deployment: { success: false, duration: 0, errors: [], assetsUploaded: 0 },
  pagesDeployment: { success: false, duration: 0, errors: [] },
  totalDuration: 0,
};

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
 * Executes a command with retries and timeout
 * @param {string} command - Command to execute
 * @param {object} options - Options for execution
 * @returns {Promise<string>} Command output
 */
async function executeCommand(command, options = {}) {
  const {
    retries = CONFIG.maxRetries,
    timeoutMs = CONFIG.timeoutMs,
    silent = false,
  } = options;
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const tryExecution = () => {
      attempts++;
      if (!silent)
        logger.verbose(
          `Executing command: ${command} (Attempt ${attempts}/${retries + 1})`
        );

      const timer = setTimeout(() => {
        proc.kill();
        if (attempts <= retries) {
          logger.warning(`Command timed out after ${timeoutMs}ms, retrying...`);
          tryExecution();
        } else {
          reject(
            new Error(
              `Command timed out after ${attempts} attempts: ${command}`
            )
          );
        }
      }, timeoutMs);

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
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout);
        } else {
          if (attempts <= retries) {
            logger.warning(`Command failed with code ${code}, retrying...`);
            tryExecution();
          } else {
            reject(
              new Error(
                `Command failed after ${attempts} attempts: ${command}\n${stderr}`
              )
            );
          }
        }
      });

      proc.on("error", (err) => {
        clearTimeout(timer);
        if (attempts <= retries) {
          logger.warning(`Command error: ${err.message}, retrying...`);
          tryExecution();
        } else {
          reject(
            new Error(
              `Command error after ${attempts} attempts: ${err.message}`
            )
          );
        }
      });
    };

    tryExecution();
  });
}

/**
 * Validates the current git branch against environment configuration
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Validation result
 */
async function validateGitBranch(environment) {
  try {
    const currentBranch = (
      await executeCommand("git rev-parse --abbrev-ref HEAD", { silent: true })
    ).trim();
    const expectedBranch = CONFIG.environments[environment].deployBranch;

    if (currentBranch !== expectedBranch) {
      logger.warning(
        `Current branch (${currentBranch}) does not match the expected branch for ${environment} (${expectedBranch})`
      );
      const confirmDeploy =
        process.env.FORCE_DEPLOY === "true" ||
        (process.env.CI !== "true" &&
          (await promptForConfirmation(`Deploy anyway? (y/N): `)));

      return confirmDeploy;
    }
    return true;
  } catch (error) {
    logger.error(`Failed to validate git branch: ${error.message}`);
    return false;
  }
}

/**
 * Prompts the user for confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} User confirmation
 */
function promptForConfirmation(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdin.resume();
    stdout.write(question);

    stdin.once("data", (data) => {
      const response = data.toString().trim().toLowerCase();
      resolve(response === "y" || response === "yes");
      stdin.pause();
    });
  });
}

/**
 * Prepares the environment for deployment
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Preparation result
 */
async function prepareEnvironment(environment) {
  logger.standard(`Preparing ${environment} environment for deployment`);

  try {
    // Check if wrangler is installed
    try {
      await executeCommand("wrangler --version", { silent: true });
    } catch (error) {
      logger.error("Wrangler not found. Installing...");
      await executeCommand("npm install -g wrangler");
    }

    // Login to Cloudflare if needed
    try {
      const whoami = await executeCommand("wrangler whoami", { silent: true });
      logger.verbose(`Logged in as: ${whoami.trim()}`);
    } catch (error) {
      if (!CONFIG.environments[environment].apiKey) {
        logger.error("No API key provided and not logged in to Cloudflare");
        return false;
      }

      // Set environment variables for API-based authentication
      process.env.CLOUDFLARE_API_TOKEN =
        CONFIG.environments[environment].apiKey;
      process.env.CLOUDFLARE_ACCOUNT_ID =
        CONFIG.environments[environment].accountId;

      logger.standard("Using API key authentication for Cloudflare");
    }

    // Check if environment exists
    if (!CONFIG.environments[environment]) {
      logger.error(`Environment "${environment}" not found in configuration`);
      return false;
    }

    // Set global environment for metrics
    deploymentMetrics.environment = environment;

    return true;
  } catch (error) {
    logger.error(`Failed to prepare environment: ${error.message}`);
    return false;
  }
}

/**
 * Validates wrangler.toml configuration
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Validation result
 */
async function validateWranglerConfig(environment) {
  const wranglerPath = path.join(CONFIG.backendDir, "wrangler.toml");

  try {
    if (!fs.existsSync(wranglerPath)) {
      logger.error("wrangler.toml not found");
      return false;
    }

    const wranglerContent = fs.readFileSync(wranglerPath, "utf-8");

    // Check for environment
    const envConfig = CONFIG.environments[environment];
    if (!wranglerContent.includes(`[env.${environment}]`)) {
      logger.error(`Environment "${environment}" not found in wrangler.toml`);
      return false;
    }

    // Validate database binding
    if (
      !wranglerContent.includes(`database_name = "${envConfig.d1Database}"`)
    ) {
      logger.warning(
        `D1 database binding might be incorrect for ${environment}`
      );
    }

    // Validate R2 bucket binding
    if (!wranglerContent.includes(`bucket_name = "${envConfig.r2Bucket}"`)) {
      logger.warning(`R2 bucket binding might be incorrect for ${environment}`);
    }

    logger.success("wrangler.toml configuration validated");
    return true;
  } catch (error) {
    logger.error(`Failed to validate wrangler.toml: ${error.message}`);
    return false;
  }
}

/**
 * Deploys the Workers backend
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Deployment result
 */
async function deployWorker(environment) {
  const startTime = Date.now();
  logger.standard(`Deploying Workers backend to ${environment}...`);

  try {
    // Navigate to backend directory
    process.chdir(CONFIG.backendDir);

    // Run tests if available
    if (fs.existsSync(path.join(CONFIG.backendDir, "tests"))) {
      try {
        logger.verbose("Running backend tests...");
        await executeCommand("npm test", { silent: true });
        logger.success("Backend tests passed");
      } catch (error) {
        logger.error(`Backend tests failed: ${error.message}`);
        if (
          !(await promptForConfirmation(
            "Deploy despite test failures? (y/N): "
          ))
        ) {
          return false;
        }
      }
    }

    // Deploy worker
    logger.standard("Deploying Worker...");
    const deployOutput = await executeCommand(
      `wrangler deploy --env ${environment}`
    );
    logger.success("Worker deployed successfully");

    // Track metrics
    deploymentMetrics.workerDeployment.success = true;
    deploymentMetrics.workerDeployment.duration = Date.now() - startTime;

    // Validate deployment if needed
    if (CONFIG.validateDeployment) {
      logger.standard("Validating Worker deployment...");
      const domain = CONFIG.environments[environment].domain;
      const healthCheck = await executeCommand(
        `curl -s https://api.${domain}/health`
      );

      if (!healthCheck.includes('"status":"ok"')) {
        logger.error("Worker health check failed");
        deploymentMetrics.workerDeployment.success = false;
        deploymentMetrics.workerDeployment.errors.push(
          "Health check failed after deployment"
        );
        return false;
      }

      logger.success("Worker deployment validated");
    }

    return true;
  } catch (error) {
    logger.error(`Worker deployment failed: ${error.message}`);
    deploymentMetrics.workerDeployment.errors.push(error.message);
    return false;
  }
}

/**
 * Runs database migrations
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Migration result
 */
async function runDatabaseMigrations(environment) {
  if (!CONFIG.runMigrations) {
    logger.verbose("Database migrations skipped (disabled in config)");
    return true;
  }

  const startTime = Date.now();
  logger.standard(`Running database migrations for ${environment}...`);

  try {
    // Navigate to backend directory
    process.chdir(CONFIG.backendDir);

    // Check if migrations directory exists
    const migrationsDir = path.join(CONFIG.backendDir, "migrations");
    if (!fs.existsSync(migrationsDir)) {
      logger.warning("No migrations directory found, skipping migrations");
      return true;
    }

    // Execute migrations
    const dbName = CONFIG.environments[environment].d1Database;
    await executeCommand(
      `wrangler d1 migrations apply ${dbName} --env ${environment}`
    );

    // Track metrics
    deploymentMetrics.d1Deployment.success = true;
    deploymentMetrics.d1Deployment.duration = Date.now() - startTime;

    logger.success("Database migrations completed");
    return true;
  } catch (error) {
    logger.error(`Database migrations failed: ${error.message}`);
    deploymentMetrics.d1Deployment.errors.push(error.message);
    return false;
  }
}

/**
 * Optimizes images for web and R2 storage
 * @param {string} filePath - Path to image file
 * @returns {Promise<Buffer>} Optimized image buffer
 */
async function optimizeImage(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Check file size, if under 100KB, just compress with zlib
      if (data.length < 102400) {
        zlib.gzip(data, { level: 9 }, (err, compressed) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(compressed);
        });
        return;
      }

      // For larger files, we'd use image-specific optimization
      // This is a simplified example - would use sharp, imagemin etc in reality
      zlib.gzip(data, { level: 7 }, (err, compressed) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(compressed);
      });
    });
  });
}

/**
 * Uploads assets to R2 bucket
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Upload result
 */
async function uploadR2Assets(environment) {
  if (!CONFIG.deployR2Assets) {
    logger.verbose("R2 asset deployment skipped (disabled in config)");
    return true;
  }

  const startTime = Date.now();
  logger.standard(`Uploading assets to R2 bucket for ${environment}...`);

  try {
    // Navigate to backend directory
    process.chdir(CONFIG.backendDir);

    // Get bucket name from config
    const bucketName = CONFIG.environments[environment].r2Bucket;

    // Check if assets directory exists
    const assetsDir = path.join(CONFIG.frontendDir, "public");
    if (!fs.existsSync(assetsDir)) {
      logger.warning("No assets directory found, skipping R2 upload");
      return true;
    }

    // Find all assets recursively
    const getFilesRecursively = (dir) => {
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
    };

    const assetFiles = getFilesRecursively(assetsDir);
    logger.verbose(`Found ${assetFiles.length} assets to upload`);

    // Upload assets with optimization if enabled
    let uploadedCount = 0;
    for (const file of assetFiles) {
      const relativePath = path.relative(assetsDir, file);
      const contentType = getContentType(file);

      let fileBuffer = fs.readFileSync(file);

      // Optimize images if enabled
      if (
        CONFIG.optimizeAssets &&
        (contentType.includes("image/") || contentType.includes("font/"))
      ) {
        try {
          fileBuffer = await optimizeImage(file);
          logger.debug(`Optimized ${relativePath}`);
        } catch (error) {
          logger.warning(
            `Failed to optimize ${relativePath}: ${error.message}`
          );
        }
      }

      // Calculate hash for etag
      const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");

      // Upload to R2
      await executeCommand(
        `wrangler r2 object put ${bucketName}/${relativePath} --file=${file} --content-type="${contentType}" --metadata='{"hash":"${hash}"}' --env ${environment}`,
        { silent: true }
      );

      uploadedCount++;
      if (uploadedCount % 10 === 0) {
        logger.standard(
          `Uploaded ${uploadedCount}/${assetFiles.length} assets...`
        );
      }
    }

    // Track metrics
    deploymentMetrics.r2Deployment.success = true;
    deploymentMetrics.r2Deployment.duration = Date.now() - startTime;
    deploymentMetrics.r2Deployment.assetsUploaded = uploadedCount;

    logger.success(
      `Uploaded ${uploadedCount} assets to R2 bucket ${bucketName}`
    );
    return true;
  } catch (error) {
    logger.error(`R2 asset upload failed: ${error.message}`);
    deploymentMetrics.r2Deployment.errors.push(error.message);
    return false;
  }
}

/**
 * Gets content type based on file extension
 * @param {string} filePath - Path to file
 * @returns {string} Content type
 */
function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "font/otf",
  };

  return contentTypes[extension] || "application/octet-stream";
}

/**
 * Deploys frontend to Cloudflare Pages
 * @param {string} environment - Environment name
 * @returns {Promise<boolean>} Deployment result
 */
async function deployPages(environment) {
  const startTime = Date.now();
  logger.standard(
    `Deploying frontend to Cloudflare Pages for ${environment}...`
  );

  try {
    // Navigate to frontend directory
    process.chdir(CONFIG.frontendDir);

    // Build the frontend
    logger.verbose("Building frontend...");
    await executeCommand("npm run build");
    logger.success("Frontend build completed");

    // Deploy to Pages
    logger.standard("Deploying to Cloudflare Pages...");
    const projectName = CONFIG.environments[environment].pagesProject;
    const deployOutput = await executeCommand(
      `wrangler pages deploy dist --project-name=${projectName} --env=${environment}`
    );

    // Extract deployment URL from output
    const deploymentUrl = deployOutput.match(
      /https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+/
    );

    if (deploymentUrl) {
      logger.success(`Frontend deployed to ${deploymentUrl[0]}`);
    } else {
      logger.success("Frontend deployed successfully");
    }

    // Track metrics
    deploymentMetrics.pagesDeployment.success = true;
    deploymentMetrics.pagesDeployment.duration = Date.now() - startTime;

    // Validate deployment if needed
    if (CONFIG.validateDeployment) {
      logger.standard("Validating Pages deployment...");
      const domain = CONFIG.environments[environment].domain;
      const healthCheck = await executeCommand(`curl -s https://${domain}/`);

      if (
        !healthCheck.includes("<html") &&
        !healthCheck.includes("<!DOCTYPE")
      ) {
        logger.error("Pages deployment validation failed");
        deploymentMetrics.pagesDeployment.success = false;
        deploymentMetrics.pagesDeployment.errors.push(
          "Health check failed after deployment"
        );
        return false;
      }

      logger.success("Pages deployment validated");
    }

    return true;
  } catch (error) {
    logger.error(`Pages deployment failed: ${error.message}`);
    deploymentMetrics.pagesDeployment.errors.push(error.message);
    return false;
  }
}

/**
 * Sends metrics to analytics endpoint
 * @returns {Promise<void>}
 */
async function sendMetrics() {
  if (!CONFIG.metrics.collect || !CONFIG.metrics.sendToAnalytics) {
    return;
  }

  try {
    logger.verbose("Sending deployment metrics to analytics...");

    const metricsData = JSON.stringify(deploymentMetrics);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(metricsData),
        Authorization: `Bearer ${process.env.ANALYTICS_API_KEY || "anonymous"}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(
        CONFIG.metrics.analyticsEndpoint,
        options,
        (res) => {
          if (res.statusCode === 200) {
            logger.verbose("Metrics sent successfully");
            resolve();
          } else {
            logger.warning(`Failed to send metrics: HTTP ${res.statusCode}`);
            resolve(); // Don't fail deployment because of metrics
          }
        }
      );

      req.on("error", (error) => {
        logger.warning(`Failed to send metrics: ${error.message}`);
        resolve(); // Don't fail deployment because of metrics
      });

      req.write(metricsData);
      req.end();
    });
  } catch (error) {
    logger.warning(`Failed to send metrics: ${error.message}`);
  }
}

/**
 * Prints deployment summary
 */
function printDeploymentSummary() {
  const endTime = Date.now();
  const totalDuration = endTime - deploymentMetrics.startTime;
  deploymentMetrics.endTime = endTime;
  deploymentMetrics.totalDuration = totalDuration;

  console.log("\n---------------------------------------------------");
  console.log(
    `📊 DEPLOYMENT SUMMARY - ${deploymentMetrics.environment.toUpperCase()}`
  );
  console.log("---------------------------------------------------");
  console.log(`🕒 Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log("---------------------------------------------------");
  console.log(
    `📡 Worker: ${
      deploymentMetrics.workerDeployment.success ? "✅ SUCCESS" : "❌ FAILED"
    } (${(deploymentMetrics.workerDeployment.duration / 1000).toFixed(2)}s)`
  );
  console.log(
    `🗄️ Database: ${
      deploymentMetrics.d1Deployment.success ? "✅ SUCCESS" : "❌ FAILED"
    } (${(deploymentMetrics.d1Deployment.duration / 1000).toFixed(2)}s)`
  );
  console.log(
    `🖼️ R2 Assets: ${
      deploymentMetrics.r2Deployment.success ? "✅ SUCCESS" : "❌ FAILED"
    } (${(deploymentMetrics.r2Deployment.duration / 1000).toFixed(2)}s)`
  );
  console.log(
    `🌐 Pages: ${
      deploymentMetrics.pagesDeployment.success ? "✅ SUCCESS" : "❌ FAILED"
    } (${(deploymentMetrics.pagesDeployment.duration / 1000).toFixed(2)}s)`
  );
  console.log("---------------------------------------------------");

  // Print any errors
  const allErrors = [
    ...deploymentMetrics.workerDeployment.errors.map((e) => `Worker: ${e}`),
    ...deploymentMetrics.d1Deployment.errors.map((e) => `Database: ${e}`),
    ...deploymentMetrics.r2Deployment.errors.map((e) => `R2 Assets: ${e}`),
    ...deploymentMetrics.pagesDeployment.errors.map((e) => `Pages: ${e}`),
  ];

  if (allErrors.length > 0) {
    console.log("\n⚠️ DEPLOYMENT ERRORS:");
    allErrors.forEach((error) => console.log(`  - ${error}`));
    console.log("---------------------------------------------------");
  }

  const url = `https://${
    CONFIG.environments[deploymentMetrics.environment].domain
  }`;
  console.log(`🚀 Application URL: ${url}`);
  console.log("---------------------------------------------------\n");
}

/**
 * Main deployment function
 * @param {string} environment - Environment to deploy to
 * @returns {Promise<boolean>} Deployment result
 */
async function deploy(environment = "dev") {
  try {
    logger.minimal(`Starting deployment to ${environment} environment...`);

    // Prepare environment
    if (!(await prepareEnvironment(environment))) {
      return false;
    }

    // Validate git branch
    if (!(await validateGitBranch(environment))) {
      return false;
    }

    // Validate wrangler.toml
    if (!(await validateWranglerConfig(environment))) {
      return false;
    }

    // Deploy worker
    if (!(await deployWorker(environment))) {
      logger.error("Worker deployment failed, stopping deployment process");
      return false;
    }

    // Run database migrations
    if (!(await runDatabaseMigrations(environment))) {
      logger.warning("Database migrations failed, continuing with deployment");
    }

    // Upload R2 assets
    if (!(await uploadR2Assets(environment))) {
      logger.warning("R2 asset upload failed, continuing with deployment");
    }

    // Deploy Pages
    if (!(await deployPages(environment))) {
      logger.error("Pages deployment failed");
      return false;
    }

    // Send metrics
    await sendMetrics();

    // Mark deployment as successful
    deploymentMetrics.success = true;

    return true;
  } catch (error) {
    logger.error(`Deployment failed: ${error.message}`);
    return false;
  } finally {
    // Always print summary
    printDeploymentSummary();
  }
}

// Run deployment if called directly
if (require.main === module) {
  const environment = process.argv[2] || "dev";
  deploy(environment)
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      logger.error(`Unhandled error: ${error.message}`);
      process.exit(1);
    });
}

// Export for programmatic use
module.exports = {
  deploy,
  CONFIG,
};
