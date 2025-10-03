-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view venues" ON venues;
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;
DROP POLICY IF EXISTS "Admins can update their own venues" ON venues;
DROP POLICY IF EXISTS "Public can view courts" ON courts;
DROP POLICY IF EXISTS "Admins can manage courts for their venues" ON courts;
DROP POLICY IF EXISTS "Public can view pricing rules" ON pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing for their venues" ON pricing_rules;
DROP POLICY IF EXISTS "Users can view matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;

-- Profiles table policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Venues table policies
CREATE POLICY "Public can view venues"
  ON venues FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND profile_type = 'admin'
    )
  );

CREATE POLICY "Admins can update their own venues"
  ON venues FOR UPDATE
  TO authenticated
  USING (owner_admin_id = auth.uid());

-- Courts table policies
CREATE POLICY "Public can view courts"
  ON courts FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage courts for their venues"
  ON courts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = courts.venue_id
      AND venues.owner_admin_id = auth.uid()
    )
  );

-- Pricing rules table policies
CREATE POLICY "Public can view pricing rules"
  ON pricing_rules FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage pricing for their venues"
  ON pricing_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = pricing_rules.venue_id
      AND venues.owner_admin_id = auth.uid()
    )
  );

-- Matches table policies
CREATE POLICY "Users can view matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    host_player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = matches.venue_id
      AND venues.owner_admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    host_player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM venues
      WHERE venues.id = matches.venue_id
      AND venues.owner_admin_id = auth.uid()
    )
  );

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This will be called by a trigger when a new user signs up
  -- The profile will be created by the application after getting user metadata
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
