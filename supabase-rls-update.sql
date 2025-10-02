-- Update RLS policies for phone-based authentication
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow public access to profiles (we'll manage auth via API)
CREATE POLICY "Allow public read access to profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to profiles"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to profiles"
  ON profiles FOR UPDATE
  TO public
  USING (true);

-- Update venue policies to allow public read
DROP POLICY IF EXISTS "Owners can update venues" ON venues;
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;

CREATE POLICY "Owners can manage venues"
  ON venues FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update courts policies
DROP POLICY IF EXISTS "Venue owners can manage courts" ON courts;

CREATE POLICY "Anyone can manage courts"
  ON courts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update pricing rules policies
DROP POLICY IF EXISTS "Venue owners can manage pricing" ON pricing_rules;

CREATE POLICY "Anyone can manage pricing"
  ON pricing_rules FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update matches policies
DROP POLICY IF EXISTS "Players can view their matches" ON matches;
DROP POLICY IF EXISTS "Venue owners can view all matches" ON matches;
DROP POLICY IF EXISTS "Players can create matches" ON matches;
DROP POLICY IF EXISTS "Players and venue owners can update matches" ON matches;

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create matches"
  ON matches FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
  ON matches FOR UPDATE
  TO public
  USING (true);
