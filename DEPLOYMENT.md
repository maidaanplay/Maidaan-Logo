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

**IMPORTANT:** Add environment variables in Vercel dashboard BEFORE deploying.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Click **Add New** and add each variable:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://phnvrgxurctcnyuajqwo.supabase.co` (or your Supabase project URL)
- **Environments:** Check all three: Production, Preview, Development
- Click **Save**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your anon key from Supabase
- **Environments:** Check all three: Production, Preview, Development
- Click **Save**

**To get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Note:** Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to Vercel - it's only for local seeding.

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
