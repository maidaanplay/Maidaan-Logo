-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public insert to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public update to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read access to venues" ON venues;
DROP POLICY IF EXISTS "Allow public insert to venues" ON venues;
DROP POLICY IF EXISTS "Allow public update to venues" ON venues;
DROP POLICY IF EXISTS "Allow public read access to courts" ON courts;
DROP POLICY IF EXISTS "Allow public insert to courts" ON courts;
DROP POLICY IF EXISTS "Allow public read access to pricing_rules" ON pricing_rules;
DROP POLICY IF EXISTS "Allow public insert to pricing_rules" ON pricing_rules;
DROP POLICY IF EXISTS "Allow public read access to matches" ON matches;
DROP POLICY IF EXISTS "Allow public insert to matches" ON matches;
DROP POLICY IF EXISTS "Allow public update to matches" ON matches;

-- Profiles table policies (public read/write for now, since we're using phone-based auth without Supabase Auth)
CREATE POLICY "Allow public read access to profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to profiles"
  ON profiles FOR UPDATE
  USING (true);

-- Venues table policies
CREATE POLICY "Allow public read access to venues"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to venues"
  ON venues FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to venues"
  ON venues FOR UPDATE
  USING (true);

-- Courts table policies
CREATE POLICY "Allow public read access to courts"
  ON courts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to courts"
  ON courts FOR INSERT
  WITH CHECK (true);

-- Pricing rules table policies
CREATE POLICY "Allow public read access to pricing_rules"
  ON pricing_rules FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to pricing_rules"
  ON pricing_rules FOR INSERT
  WITH CHECK (true);

-- Matches table policies
CREATE POLICY "Allow public read access to matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to matches"
  ON matches FOR UPDATE
  USING (true);

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON venues TO anon, authenticated;
GRANT ALL ON courts TO anon, authenticated;
GRANT ALL ON pricing_rules TO anon, authenticated;
GRANT ALL ON matches TO anon, authenticated;

-- Grant access to sequences if any
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
