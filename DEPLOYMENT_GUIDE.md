# Maidaan - Deployment Guide

## Pre-Deployment Setup

### 1. Configure Supabase

#### A. Run Database Schema
1. Go to your Supabase Dashboard → SQL Editor
2. Run `supabase-schema-update.sql` (creates tables and updates schema)
3. Run `supabase-secure-rls-policies.sql` (sets up Row Level Security)

#### B. Configure Auth Settings
1. Go to Authentication → URL Configuration
2. Add your production URL to **Site URL**: `https://yourdomain.com`
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local testing)

#### C. Email Templates (Optional but Recommended)
1. Go to Authentication → Email Templates
2. Customize the "Magic Link" template
3. Make sure it's user-friendly and matches your brand

### 2. Environment Variables

Ensure these are set in your deployment platform (Vercel/Netlify/etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How Authentication Works Now

### Login Flow:
1. User enters email on login page
2. System checks if profile exists
3. Supabase sends magic link email
4. User clicks magic link
5. Redirected to `/auth/callback`
6. Profile created/loaded
7. User redirected to appropriate dashboard

### Security Features:
✅ **Session-based auth** - Supabase manages JWT tokens securely
✅ **RLS protection** - Row Level Security enforces data access rules
✅ **Cross-device support** - Works on any device with email access
✅ **Auto token refresh** - Sessions stay valid automatically
✅ **Secure by default** - No vulnerable localStorage for auth

## Testing Locally

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/login?role=player`
3. Enter your email
4. Check your email for magic link
5. Click the link
6. You should be redirected to `/players` dashboard

##  Deployment Steps

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### After Deployment

1. Test login flow on production
2. Verify emails are being sent
3. Check that RLS policies are working
4. Test both admin and player flows

## Troubleshooting

### "Could not find table 'profiles'"
- Run `supabase-secure-rls-policies.sql` in Supabase SQL Editor
- Make sure RLS is enabled on all tables

### Magic link not working
- Check redirect URLs in Supabase dashboard
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check email spam folder

### "Unauthorized" errors
- User might not be authenticated
- Check if session exists: `supabase.auth.getSession()`
- Verify RLS policies allow the operation

### Cross-device not working
- This should work automatically now with Supabase Auth
- Sessions are stored securely in HTTP-only cookies

## Migration from Old System

If you have existing users with phone-based localStorage auth:

1. They will need to re-register with email
2. Old localStorage data will be ignored
3. New secure sessions will be created

## Security Best Practices

✅ Never commit `.env.local` to git
✅ Use different Supabase projects for dev/staging/production
✅ Regularly rotate service role keys
✅ Monitor Supabase Auth logs for suspicious activity
✅ Keep Next.js and Supabase libraries updated

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify all environment variables are set
4. Test with a fresh incognito browser session
