# Database Seeding Guide

This guide will help you seed your Supabase database with test data including an admin user, venue, courts, and player accounts.

## Prerequisites

1. Supabase project is set up
2. Database schema has been run (see `SETUP.md`)
3. Environment variables are configured

## Steps

### 1. Get Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Copy the **service_role** key (⚠️ Keep this secret!)

### 2. Add Service Role Key to .env.local

Open `.env.local` and add your service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key
```

### 3. Run the Schema (First Time Only)

If you haven't already, run the database schema:

1. Open Supabase Dashboard > **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables and policies

### 4. Run the Seed Script

```bash
npm run seed
```

## What Gets Created

The seed script creates:

### Admin Account
- **Email:** admin@maidaan.com
- **Password:** admin123
- **Role:** Admin
- **Contact:** 9999999999

### Venue
- **Name:** Velocity Sports Hub
- **Location:** Andheri West, Mumbai, India
- **Hours:** 6:00 AM - 11:00 PM
- **Amenities:** Parking, Changing Room, Water, First Aid, WiFi

### Courts
1. Basketball - Court 1 🏀
2. Basketball - Court 2 🏀
3. Volleyball - Court 1 🏐
4. Badminton - Court 1 🏸

### Pricing Rules
**Weekdays:**
- Morning (6 AM - 12 PM): ₹800/hour
- Afternoon (12 PM - 6 PM): ₹1000/hour
- Evening (6 PM - 11 PM): ₹1500/hour

**Weekends:**
- Morning: ₹1000/hour
- Afternoon: ₹1200/hour
- Evening: ₹1800/hour

### Player Accounts
1. **Email:** player1@test.com | **Password:** player123
2. **Email:** player2@test.com | **Password:** player123

## Testing the Admin Portal

1. Go to http://localhost:3000
2. Click **Continue as Admin**
3. Login with:
   - Email: `admin@maidaan.com`
   - Password: `admin123`
4. You should see the admin dashboard with the venue and courts

## Troubleshooting

### "Error creating admin user: User already registered"
The admin user already exists. You can either:
- Skip the admin creation
- Delete the user from Supabase Dashboard > Authentication > Users
- Use a different email in the seed script

### "Missing service role key"
Make sure you've added `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file.

### "Error creating venue: permission denied"
Make sure:
1. The database schema has been run
2. RLS policies are set up correctly
3. The service role key is correct

## Security Note

⚠️ **IMPORTANT:** The service role key bypasses Row Level Security. Never commit it to version control or expose it in client-side code. It should only be used in secure server-side scripts.
