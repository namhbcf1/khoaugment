#!/bin/bash

# Deploy script cho Cloudflare Pages
echo "🚀 Starting deployment process..."

# 1. Go to frontend directory directly
echo "📁 Navigating to frontend directory..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ frontend/package.json not found!"
    exit 1
fi

echo "📂 Found project at: $(pwd)"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 3. Build project with Cloudflare optimizations
echo "🔨 Building project with Cloudflare optimizations..."
npm run build:cloudflare

# 4. Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found!"
    exit 1
fi

echo "✅ Build successful!"
ls -la dist/

# 5. Verify MIME type configuration
echo "🔍 Verifying MIME type configuration..."
if [ ! -f "dist/_headers" ]; then
    echo "⚠️ Warning: _headers file is missing! Creating one..."
    cat > dist/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  
/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  
/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
  
/assets/*
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable
EOF
    echo "✅ Created _headers file"
fi

if [ ! -f "dist/_routes.json" ]; then
    echo "⚠️ Warning: _routes.json file is missing! Creating one..."
    cat > dist/_routes.json << EOF
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/*.json", "/*.png", "/*.svg", "/*.jpg", "/*.webp"],
  "routes": [
    {
      "src": "^/assets/.+\\.(js|mjs)$",
      "headers": {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "^/assets/.+\\.css$",
      "headers": {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": ".*",
      "dest": "/index.html"
    }
  ]
}
EOF
    echo "✅ Created _routes.json file"
fi

# 6. Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name="khoaugment" --commit-message="Deploy from script $(date)" --branch=main --no-bundle

echo "🎉 Deployment complete!"