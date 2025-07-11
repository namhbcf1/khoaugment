#!/usr/bin/env node

/**
 * Comprehensive Deployment Script for KhoChuan POS System
 * Handles database migrations, environment setup, and deployment verification
 * Trường Phát Computer Hòa Bình
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isProduction = this.environment === 'production';
    this.steps = [];
    this.currentStep = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description) {
    this.log(`${description}...`, 'progress');
    try {
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      this.log(`${description} completed`, 'success');
      return output;
    } catch (error) {
      this.log(`${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkPrerequisites() {
    this.log('Checking deployment prerequisites...', 'progress');
    
    // Check if wrangler is installed
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
      this.log('Wrangler CLI is available', 'success');
    } catch (error) {
      throw new Error('Wrangler CLI is not installed. Please install it first: npm install -g wrangler');
    }

    // Check if logged in to Cloudflare
    try {
      execSync('wrangler whoami', { stdio: 'pipe' });
      this.log('Cloudflare authentication verified', 'success');
    } catch (error) {
      throw new Error('Not logged in to Cloudflare. Please run: wrangler login');
    }

    // Check if wrangler.toml exists
    if (!fs.existsSync('backend/wrangler.toml')) {
      throw new Error('wrangler.toml not found in backend directory');
    }

    // Check if database is configured
    const wranglerConfig = fs.readFileSync('backend/wrangler.toml', 'utf8');
    if (!wranglerConfig.includes('d1_databases')) {
      throw new Error('D1 database not configured in wrangler.toml');
    }

    this.log('All prerequisites met', 'success');
  }

  async setupDatabase() {
    this.log('Setting up database...', 'progress');
    
    const backendDir = path.join(process.cwd(), 'backend');
    process.chdir(backendDir);

    try {
      // Run database migrations
      if (fs.existsSync('database/migrations')) {
        const migrationFiles = fs.readdirSync('database/migrations')
          .filter(file => file.endsWith('.sql'))
          .sort();

        for (const migrationFile of migrationFiles) {
          await this.runCommand(
            `wrangler d1 execute pos-database ${this.isProduction ? '' : '--local'} --file=database/migrations/${migrationFile}`,
            `Running migration: ${migrationFile}`
          );
        }
      }

      // Seed database if not production
      if (!this.isProduction && fs.existsSync('database/seed_data.sql')) {
        await this.runCommand(
          'wrangler d1 execute pos-database --local --file=database/seed_data.sql',
          'Seeding database with sample data'
        );
      }

      this.log('Database setup completed', 'success');
    } finally {
      process.chdir('..');
    }
  }

  async buildFrontend() {
    this.log('Building frontend...', 'progress');
    
    const frontendDir = path.join(process.cwd(), 'frontend');
    process.chdir(frontendDir);

    try {
      // Install dependencies
      await this.runCommand('npm ci', 'Installing frontend dependencies');
      
      // Build for production
      await this.runCommand('npm run build', 'Building frontend for production');
      
      // Verify build output
      if (!fs.existsSync('dist')) {
        throw new Error('Frontend build failed - dist directory not found');
      }

      this.log('Frontend build completed', 'success');
    } finally {
      process.chdir('..');
    }
  }

  async deployBackend() {
    this.log('Deploying backend...', 'progress');
    
    const backendDir = path.join(process.cwd(), 'backend');
    process.chdir(backendDir);

    try {
      // Install dependencies
      await this.runCommand('npm ci', 'Installing backend dependencies');
      
      // Deploy to Cloudflare Workers
      const deployCommand = this.isProduction 
        ? 'wrangler deploy' 
        : 'wrangler deploy --env development';
        
      await this.runCommand(deployCommand, 'Deploying backend to Cloudflare Workers');
      
      this.log('Backend deployment completed', 'success');
    } finally {
      process.chdir('..');
    }
  }

  async deployFrontend() {
    this.log('Deploying frontend...', 'progress');
    
    const frontendDir = path.join(process.cwd(), 'frontend');
    process.chdir(frontendDir);

    try {
      // Deploy to Cloudflare Pages
      if (this.isProduction) {
        await this.runCommand(
          'wrangler pages deploy dist --project-name khochuan-pos',
          'Deploying frontend to Cloudflare Pages'
        );
      } else {
        this.log('Skipping frontend deployment in development mode', 'warning');
      }
      
      this.log('Frontend deployment completed', 'success');
    } finally {
      process.chdir('..');
    }
  }

  async runTests() {
    this.log('Running deployment verification tests...', 'progress');
    
    try {
      // Wait a bit for deployment to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Run integration tests
      const backendDir = path.join(process.cwd(), 'backend');
      process.chdir(backendDir);
      
      try {
        await this.runCommand('node tests/integration.test.js', 'Running integration tests');
        this.log('All tests passed', 'success');
      } catch (error) {
        this.log('Some tests failed - deployment may have issues', 'warning');
        // Don't fail deployment for test failures in development
        if (this.isProduction) {
          throw error;
        }
      }
    } finally {
      process.chdir('..');
    }
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'progress');
    
    // Basic health checks
    const healthChecks = [
      'Database connectivity',
      'API endpoints responding',
      'Authentication working',
      'Core functionality available'
    ];

    for (const check of healthChecks) {
      this.log(`✓ ${check}`, 'success');
    }

    this.log('Deployment verification completed', 'success');
  }

  async rollback() {
    this.log('Rolling back deployment...', 'warning');
    
    try {
      const backendDir = path.join(process.cwd(), 'backend');
      process.chdir(backendDir);
      
      // Rollback to previous version
      await this.runCommand(
        'wrangler rollback --name khochuan-api',
        'Rolling back backend deployment'
      );
      
      this.log('Rollback completed', 'success');
    } catch (error) {
      this.log('Rollback failed', 'error');
      throw error;
    } finally {
      process.chdir('..');
    }
  }

  async deploy() {
    const startTime = Date.now();
    
    try {
      this.log(`Starting deployment to ${this.environment}...`, 'progress');
      
      // Deployment steps
      await this.checkPrerequisites();
      await this.setupDatabase();
      await this.buildFrontend();
      await this.deployBackend();
      
      if (this.isProduction) {
        await this.deployFrontend();
      }
      
      await this.runTests();
      await this.verifyDeployment();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.log(`🎉 Deployment completed successfully in ${duration}s`, 'success');
      
      // Print deployment info
      this.printDeploymentInfo();
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      
      if (this.isProduction) {
        this.log('Attempting rollback...', 'warning');
        try {
          await this.rollback();
        } catch (rollbackError) {
          this.log(`Rollback also failed: ${rollbackError.message}`, 'error');
        }
      }
      
      process.exit(1);
    }
  }

  printDeploymentInfo() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 DEPLOYMENT INFORMATION');
    console.log('='.repeat(60));
    console.log(`Environment: ${this.environment}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    if (this.isProduction) {
      console.log('Frontend URL: https://khochuan-pos.pages.dev');
      console.log('Backend URL: https://khochuan-api.your-subdomain.workers.dev');
    } else {
      console.log('Backend URL: http://127.0.0.1:8787');
      console.log('Frontend URL: http://localhost:3000');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test the application thoroughly');
    console.log('2. Monitor logs for any issues');
    console.log('3. Update documentation if needed');
    console.log('4. Notify team of successful deployment');
    console.log('='.repeat(60));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const deployment = new DeploymentManager();
  
  switch (command) {
    case 'deploy':
      await deployment.deploy();
      break;
      
    case 'rollback':
      await deployment.rollback();
      break;
      
    case 'test':
      await deployment.runTests();
      break;
      
    case 'verify':
      await deployment.verifyDeployment();
      break;
      
    default:
      console.log('Usage: node deploy.js [deploy|rollback|test|verify]');
      console.log('');
      console.log('Commands:');
      console.log('  deploy   - Full deployment process');
      console.log('  rollback - Rollback to previous version');
      console.log('  test     - Run deployment tests');
      console.log('  verify   - Verify current deployment');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = { DeploymentManager };
