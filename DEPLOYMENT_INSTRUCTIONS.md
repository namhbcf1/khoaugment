# KhoAugment POS - Deployment Instructions

This guide provides step-by-step instructions to deploy the KhoAugment POS system on Cloudflare's infrastructure.

## Prerequisites

1. Cloudflare account with access to:

   - Cloudflare Workers
   - Cloudflare Pages
   - Cloudflare D1 (Database)
   - Cloudflare R2 (Storage)
   - Cloudflare KV (Key-Value store)

2. Node.js 16.0.0 or higher
3. Wrangler CLI (install globally with `npm install -g wrangler`)
4. Git

## Step 1: Clone the Repository

```bash
git clone <repository-url> khoaugment-pos
cd khoaugment-pos
```

## Step 2: Setup Environment

Run the environment setup script to configure Cloudflare resources:

```bash
./scripts/setup-cloudflare-env.sh
```

This script will:

- Create D1 database
- Create KV namespace
- Create R2 bucket
- Configure JWT secret
- Set up environment variables

## Step 3: Install Dependencies

Install all project dependencies:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

## Step 4: Initialize Database

Apply database migrations:

```bash
cd backend
npm run db:migrate:prod
```

Seed the database with initial data:

```bash
npm run db:seed:prod
cd ..
```

## Step 5: Deploy Backend

Deploy the backend API to Cloudflare Workers:

```bash
cd backend
npm run deploy:production
cd ..
```

## Step 6: Deploy Frontend

Build and deploy the frontend to Cloudflare Pages:

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name khoaugment-pos
cd ..
```

## Step 7: Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard > Pages
2. Select your project (khoaugment-pos)
3. Go to Custom domains
4. Add your domain and follow the verification steps

For the API:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker (khoaugment-backend-prod)
3. Go to Triggers > Custom domains
4. Add your API domain

## Step 8: Test the Deployment

1. Open your frontend URL (https://khoaugment-pos.pages.dev)
2. Login with default credentials:
   - Email: admin@example.com
   - Password: admin123 (change this immediately after login)

## Troubleshooting

### Database Connection Issues

- Verify D1 database ID in backend/.env
- Check that migrations were applied successfully

### API Connection Issues

- Ensure API URL is correctly configured in frontend/.env
- Check CORS settings in backend wrangler.toml

### Deployment Failures

- Review Cloudflare Workers logs in the dashboard
- Check for any errors in the deployment script output

## Maintenance

### Updating the Application

To update the application after making changes:

```bash
# Deploy everything
npm run deploy

# Or deploy specific components
cd backend && npm run deploy:production
cd ../frontend && npm run build && wrangler pages deploy dist
```

### Monitoring

Monitor your application using:

- Cloudflare Analytics
- Workers Logs
- D1 Database Metrics

## Security Considerations

- Change default credentials immediately
- Set up Cloudflare Access for admin interfaces
- Regularly rotate JWT secrets
- Keep dependencies updated

For detailed deployment information, refer to the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
