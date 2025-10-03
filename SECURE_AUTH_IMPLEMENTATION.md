# Secure Authentication Implementation Guide

This guide explains how to implement proper Supabase Auth with OTP (Magic Links) for secure, long-term authentication.

## Current Issue
The app currently uses localStorage-based authentication which is vulnerable and doesn't work across devices. We need to implement proper Supabase Auth.

## Solution: Supabase Auth with Phone OTP

### Step 1: Configure Supabase Auth

1. **Enable Phone Auth in Supabase Dashboard:**
   - Go to Authentication → Providers
   - Enable "Phone" provider
   - Configure your Twilio/MessageBird credentials for SMS
   - Or use Email OTP as an alternative (no SMS service needed)

2. **Run the secure RLS policies:**
   ```sql
   -- Run supabase-secure-rls-policies.sql in Supabase SQL Editor
   ```

### Step 2: Update Login Flow

The login flow needs to be updated to use Supabase Auth:

**For Phone OTP:**
```typescript
// Send OTP
const { error } = await supabase.auth.signInWithOtp({
  phone: '+1234567890',
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+1234567890',
  token: '123456',
  type: 'sms'
})
```

**For Email OTP (Easier, no SMS service needed):**
```typescript
// Send magic link
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback'
  }
})
```

### Step 3: Update Profile Store

Replace localStorage with Supabase Auth session:

```typescript
loadCurrentUser: async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Load profile from database using auth.uid()
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    set({ profile, isLoading: false });
    return profile;
  }

  set({ profile: null, isLoading: false });
  return null;
},

logout: async () => {
  await supabase.auth.signOut();
  set({ profile: null, isLoading: false });
}
```

### Step 4: Update API Routes

API routes now use auth.uid() from the session:

```typescript
// In API routes, check authentication
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Use user.id for queries
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

### Step 5: RLS Policies Explained

The secure RLS policies ensure:

**Profiles:**
- Users can view all profiles (for discovering players)
- Users can only create/update their own profile (auth.uid() = id)

**Venues:**
- Everyone can view venues (public browsing)
- Only admins can create venues
- Admins can only update their own venues

**Courts & Pricing:**
- Everyone can view
- Only venue owners can modify

**Matches:**
- Authenticated users can view all matches
- Users can create matches they host
- Users can only update their own matches or matches at their venues

## Benefits of This Approach

1. **Secure:** Sessions managed by Supabase, not vulnerable localStorage
2. **Cross-device:** Works across devices using proper auth tokens
3. **Scalable:** Built on industry-standard OAuth/JWT
4. **RLS Protected:** Database enforces access control at row level
5. **Long-term:** Sustainable architecture for production

## Migration Path

1. Run `supabase-secure-rls-policies.sql` in Supabase SQL Editor
2. Update login page to use Supabase Auth OTP
3. Update profile store to use session instead of localStorage
4. Update API routes to check authentication
5. Test with multiple devices/browsers
6. Deploy

## Recommended: Email OTP (Magic Links)

For fastest implementation without SMS service:

1. Use email instead of phone for signup
2. Supabase sends magic link email automatically
3. User clicks link → authenticated
4. No SMS service configuration needed
5. Works immediately

Would you like me to implement the full Email OTP flow?
