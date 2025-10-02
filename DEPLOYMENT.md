# Vercel Deployment Guide

This guide will help you deploy Maidaan to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up with the schema

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your Maidaan repository
4. Click "Import"

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional (for seeding - not needed in production)

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To get these values:**
1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (optional)

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `your-project.vercel.app`

## Post-Deployment

### Set up Custom Domain (Optional)

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

### Environment Variables Management

To update environment variables:
1. Go to Vercel project → Settings → Environment Variables
2. Edit or add new variables
3. Redeploy for changes to take effect

## Vercel Configuration

The project includes a `vercel.json` file with:
- Build command: `npm run build`
- Dev command: `npm run dev`
- Framework: Next.js
- Region: Mumbai (bom1) - Change if needed

## Build Success

✅ The project has been tested and builds successfully
✅ All TypeScript errors have been resolved
✅ Production-ready

## Troubleshooting

### Build Fails

If the build fails:
1. Check the build logs in Vercel
2. Ensure all environment variables are set
3. Run `npm run build` locally to debug

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after changing environment variables
- Check for typos in variable names

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase dashboard for any service issues
- Ensure Row Level Security policies are configured

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
