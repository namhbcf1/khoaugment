#!/bin/bash
# GitHub Setup Script for KhoChuan POS System
# Trường Phát Computer Hòa Bình
# Usage: ./scripts/setup-github.sh [repository-url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository URL (can be passed as argument)
REPO_URL=${1:-""}

echo -e "${BLUE}🚀 KhoChuan POS - GitHub Setup Script${NC}"
echo -e "${BLUE}====================================${NC}"

# Check if Git is installed
check_git() {
    echo -e "${YELLOW}📋 Checking Git installation...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Git is installed${NC}"
}

# Initialize Git repository
init_git() {
    echo -e "${YELLOW}📁 Initializing Git repository...${NC}"
    
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${YELLOW}⚠️ Git repository already exists${NC}"
    fi
}

# Create .gitignore file
create_gitignore() {
    echo -e "${YELLOW}📝 Creating .gitignore file...${NC}"
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist/
build/
.output/
.nuxt/
.next/
.vercel/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Cloudflare
.wrangler/
wrangler.toml.bak

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
tmp/
temp/

# Test results
test-results/
playwright-report/
coverage/

# Deployment
.vercel/
.netlify/

# Local development
.local/
EOF

    echo -e "${GREEN}✅ .gitignore file created${NC}"
}

# Create GitHub repository information
create_repo_info() {
    echo -e "${YELLOW}📄 Creating repository information...${NC}"
    
    # Create a comprehensive project description
    cat > GITHUB_SETUP.md << 'EOF'
# 🏪 KhoChuan POS System - GitHub Repository

## 📋 Repository Setup Instructions

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" or go to https://github.com/new
3. Repository name: `khochuan-pos`
4. Description: `Enterprise Point of Sale System - Trường Phát Computer Hòa Bình`
5. Set to Public or Private (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we have them)
7. Click "Create repository"

### 2. Connect Local Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/khochuan-pos.git
git branch -M main
git push -u origin main
```

### 3. Setup GitHub Actions (Optional)
The repository includes GitHub Actions workflow for automatic deployment:
- `.github/workflows/deploy.yml` - Automated deployment to Cloudflare

To enable automatic deployment:
1. Go to repository Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### 4. Repository Structure
```
khochuan-pos/
├── frontend/                 # React frontend application
├── backend/                  # Cloudflare Workers API
├── scripts/                  # Deployment and setup scripts
├── .github/workflows/        # GitHub Actions workflows
├── docs/                     # Documentation
├── README.md                 # Project documentation
└── README-DEPLOYMENT.md      # Deployment instructions
```

### 5. Branch Protection (Recommended)
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### 6. Issues and Project Management
- Use GitHub Issues for bug tracking
- Use GitHub Projects for project management
- Use GitHub Discussions for community

## 🔗 Useful Links

- **Live Demo**: https://khoaugment.pages.dev
- **API Documentation**: https://khoaugment-api.bangachieu2.workers.dev
- **Deployment Guide**: README-DEPLOYMENT.md

## 📞 Support

For questions about this repository setup:
- Create an issue in the repository
- Contact: Trường Phát Computer Hòa Bình
EOF

    echo -e "${GREEN}✅ Repository information created${NC}"
}

# Add all files to Git
add_files() {
    echo -e "${YELLOW}📦 Adding files to Git...${NC}"
    
    git add .
    echo -e "${GREEN}✅ Files added to Git${NC}"
}

# Create initial commit
create_commit() {
    echo -e "${YELLOW}💾 Creating initial commit...${NC}"
    
    git commit -m "🎉 Initial commit: KhoChuan POS System

✨ Features:
- Complete POS system with React frontend
- Cloudflare Workers backend with D1 database
- Real-time inventory management
- Customer relationship management
- Sales analytics and reporting
- PWA with offline support
- Role-based access control
- AI-powered recommendations

🏗️ Architecture:
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Cloudflare Workers + D1 + WebSocket
- Database: SQLite with complete schema and seed data
- Deployment: GitHub Actions + Cloudflare

🎯 Status: Production Ready
📍 Company: Trường Phát Computer Hòa Bình
📅 Date: $(date +'%Y-%m-%d')
🚀 Version: 1.0.0"

    echo -e "${GREEN}✅ Initial commit created${NC}"
}

# Setup remote repository
setup_remote() {
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}📡 Repository URL not provided${NC}"
        echo -e "${BLUE}Please create a GitHub repository and run:${NC}"
        echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/khochuan-pos.git${NC}"
        echo -e "${BLUE}git branch -M main${NC}"
        echo -e "${BLUE}git push -u origin main${NC}"
    else
        echo -e "${YELLOW}📡 Setting up remote repository...${NC}"
        
        git remote add origin "$REPO_URL"
        git branch -M main
        
        echo -e "${GREEN}✅ Remote repository configured${NC}"
        echo -e "${BLUE}Ready to push with: git push -u origin main${NC}"
    fi
}

# Display final instructions
show_instructions() {
    echo -e "${GREEN}🎉 GitHub setup completed successfully!${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo -e "${BLUE}1. Create GitHub repository at: https://github.com/new${NC}"
    echo -e "${BLUE}2. Repository name: khochuan-pos${NC}"
    echo -e "${BLUE}3. Description: Enterprise Point of Sale System - Trường Phát Computer Hòa Bình${NC}"
    echo -e "${BLUE}4. Run these commands:${NC}"
    echo -e "${GREEN}   git remote add origin https://github.com/YOUR_USERNAME/khochuan-pos.git${NC}"
    echo -e "${GREEN}   git branch -M main${NC}"
    echo -e "${GREEN}   git push -u origin main${NC}"
    echo -e "${BLUE}5. Setup GitHub Actions secrets for automatic deployment${NC}"
    echo -e "${BLUE}6. Check GITHUB_SETUP.md for detailed instructions${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Main setup process
main() {
    echo -e "${BLUE}Starting GitHub setup process...${NC}"
    
    check_git
    init_git
    create_gitignore
    create_repo_info
    add_files
    create_commit
    setup_remote
    show_instructions
    
    echo -e "${GREEN}✅ GitHub setup process completed!${NC}"
}

# Handle script interruption
trap 'echo -e "${RED}❌ Setup interrupted${NC}"; exit 1' INT TERM

# Run main function
main
