# VentureWire Setup Guide

This document provides step-by-step instructions to deploy VentureWire to production.

## Prerequisites

- GitHub account with repository set up
- Vercel account
- Supabase account (PostgreSQL database)
- OpenAI API key

## Step 1: Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to Settings > Database > Connection String
4. Copy the URI (ensure you select "Node.js")
5. Copy this to your `.env.local` as `DATABASE_URL`

## Step 2: OpenAI API Key

1. Go to [OpenAI API](https://platform.openai.com)
2. Create an API key in Settings > API Keys
3. Copy to `.env.local` as `OPENAI_API_KEY`

## Step 3: Environment Setup

Create `.env.local` in project root:

```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
OPENAI_API_KEY=sk-...
CRON_SECRET=your-secure-secret-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 4: Local Testing

```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev

# Visit http://localhost:3000
```

## Step 5: Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import from GitHub (select your repository)
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel link
vercel
```

## Step 6: Configure Environment Variables in Vercel

1. Go to your Vercel project
2. Settings > Environment Variables
3. Add the following:
   - `DATABASE_URL` - Your Supabase connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `CRON_SECRET` - A secure random string

4. Ensure variables are set for Production, Preview, and Development

## Step 7: Configure Cron Jobs

Create `vercel.json` in project root:

```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 */6 * * *"
  }]
}
```

This runs the scraper every 6 hours. Commit and push:

```bash
git add vercel.json
git commit -m "Add cron job configuration"
git push origin main
```

## Step 8: Database Migrations on Vercel

```bash
# Run migrations in Vercel environment
vercel env pull  # Pull environment variables
npx prisma migrate deploy
```

## Step 9: Populate Initial Data

### Option 1: Manual Cron Trigger

Visit: `https://your-domain.com/api/cron/scrape`

(Add `?token=your-cron-secret` if needed)

### Option 2: Database Seeding

Create `prisma/seed.ts`:

```typescript
import { prisma } from '../src/lib/prisma';

async function main() {
  const firms = [
    { name: 'Andreessen Horowitz', slug: 'a16z', website: 'https://a16z.com' },
    // ... other firms
  ];

  for (const firm of firms) {
    await prisma.vCFirm.upsert({
      where: { slug: firm.slug },
      update: {},
      create: firm,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
```

Then run:

```bash
npx prisma db seed
```

## Step 10: Verify Deployment

1. Visit your Vercel URL
2. Check that homepage loads
3. Verify API endpoints:
   - `https://your-domain.com/api/articles`
   - `https://your-domain.com/api/firms`
   - `https://your-domain.com/api/search?q=test`

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db execute --stdin < connection-test.sql

# View Prisma logs
PRISMA_DEBUG=* npx prisma migrate dev
```

### API Errors

1. Check Vercel Function Logs:
   - Go to Vercel project
   - Go to Deployments > Logs

2. Check Supabase Activity:
   - Go to Supabase dashboard
   - View logs for SQL errors

### Cron Job Not Running

1. Verify `vercel.json` is in root
2. Check Vercel project settings > Cron Jobs
3. Manually trigger to test:
```bash
curl https://your-domain.com/api/cron/scrape \
  -H "Authorization: Bearer your-cron-secret"
```

## Monitoring

### Set up Error Tracking

1. Create Sentry account: https://sentry.io
2. Add to `next.config.ts`:
```typescript
withSentryConfig(nextConfig, {
  org: "your-org",
  project: "venturewire",
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

### Monitor Database Usage

- Supabase Dashboard > Database > Usage
- Set up email alerts for quota usage

## Performance Optimization

1. **Enable ISR** (Incremental Static Regeneration):
   - Set `revalidate` in page components

2. **Add Caching**:
   - Use Redis for article lists
   - Cache OpenAI responses

3. **Optimize Images**:
   - Vercel Image Optimization enabled by default
   - Use Next.js `<Image>` component

## Next Steps

1. **Set up Analytics**:
   - Vercel Web Analytics
   - Google Analytics

2. **Add Custom Domain**:
   - Vercel Settings > Domains
   - Add your domain

3. **Enable Preview Deployments**:
   - Create feature branches
   - Vercel auto-deploys to preview URL

## Support

For issues:
1. Check Vercel logs
2. Review Supabase activity
3. Open issue on GitHub
4. Contact support@vercel.com

---

Need help? Check the main README.md for more information.
