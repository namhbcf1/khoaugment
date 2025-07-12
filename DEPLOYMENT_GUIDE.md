# KhoAugment POS - Deployment Guide

This guide will help you deploy the KhoAugment POS system to Cloudflare's infrastructure.

## Prerequisites

Before starting, make sure you have the following:

1. A Cloudflare account with access to:

   - Cloudflare Workers
   - Cloudflare Pages
   - Cloudflare D1 (Database)
   - Cloudflare R2 (Storage)
   - Cloudflare KV (Key-Value store)

2. The Wrangler CLI installed globally:

   ```bash
   npm install -g wrangler
   ```

3. Node.js 16.0.0 or higher installed

## Deployment Steps

### 1. Setup Cloudflare Environment

First, run the environment setup script to create the necessary Cloudflare resources:

```bash
./scripts/setup-cloudflare-env.sh
```

This script will:

- Create a D1 database (if it doesn't exist)
- Create a KV namespace (if it doesn't exist)
- Create an R2 bucket (if it doesn't exist)
- Set up JWT secret for authentication
- Configure environment variables in backend/.env

### 2. Configure Your Application

#### Database Configuration

The setup script will create a D1 database and add its ID to your environment variables. To apply the database schema:

```bash
cd backend
npm run db:migrate:prod
```

If you need to seed the database with initial data:

```bash
npm run db:seed:prod
```

#### Frontend Configuration

Update frontend environment configuration if needed (edit frontend/.env):

```
VITE_API_URL=https://khoaugment-backend-prod.username.workers.dev
```

### 3. Deploy the Application

You can deploy both frontend and backend with a single command:

```bash
npm run deploy
```

This will run the `scripts/deploy-all.sh` script that handles the deployment process for both parts of the application.

Alternatively, you can deploy each part separately:

#### Backend Deployment

```bash
cd backend
npm run deploy:production
```

#### Frontend Deployment

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name khoaugment-pos
```

### 4. Configure Custom Domain (Optional)

To use a custom domain for your application:

1. Go to the Cloudflare Pages dashboard
2. Select your project (khoaugment-pos)
3. Go to "Custom domains"
4. Add your domain and follow the verification process

Similarly, you can set up a custom domain for your API (Workers):

1. Go to the Cloudflare Workers dashboard
2. Select your worker (khoaugment-backend-prod)
3. Go to "Triggers" > "Custom domains"
4. Add your domain

### 5. Setup Cloudflare Access (Optional)

For additional security, you can set up Cloudflare Access to protect your admin interface:

1. Go to the Cloudflare dashboard > "Access"
2. Create a new application
3. Set the domain pattern (e.g., admin.yourdomain.com)
4. Configure access policies

## Monitoring and Maintenance

### Viewing Logs

To view the logs from your Workers:

```bash
cd backend
npm run logs
```

### Monitoring Usage

Monitor your Cloudflare resource usage in the Cloudflare dashboard to ensure you stay within the free tier limits:

- Workers: 100,000 requests/day
- D1: 5,000,000 reads/day and 100,000 writes/day
- R2: 10GB storage and 10GB egress/month
- KV: 1GB storage

### Updating the Application

To update the application after changes:

1. Push your changes to the repository
2. Run the deployment script again:

```bash
npm run deploy
```

## Troubleshooting

### Common Issues

#### 1. Deployment Failures

If deployment fails, check the error messages and Cloudflare logs. Common issues include:

- Exceeded resource limits
- Syntax errors in your code
- Missing environment variables

#### 2. Database Connection Issues

If you're experiencing database connection issues:

- Verify your D1 database ID is correct in backend/.env
- Check that migrations have been applied
- Ensure your Worker has the necessary permissions

#### 3. CORS Issues

If you're experiencing CORS issues:

- Check the CORS_ORIGIN variable in wrangler.toml
- Ensure your frontend URL is included in the allowed origins

For more detailed troubleshooting, refer to the `TROUBLESHOOTING.md` file.

## Security Considerations

- Always use environment variables for sensitive information
- Never commit secrets to your repository
- Set up proper authentication and authorization
- Regularly update dependencies to patch security vulnerabilities

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Hono.js Documentation](https://hono.dev/)
- [React Documentation](https://react.dev/)
