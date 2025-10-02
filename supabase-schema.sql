-- Maidaan Platform - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_number VARCHAR(10) UNIQUE NOT NULL,
  profile_type VARCHAR(10) CHECK (profile_type IN ('admin', 'player')) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  jersey_name VARCHAR(50),
  jersey_number INTEGER,
  skill_level VARCHAR(20) CHECK (skill_level IN ('bronze', 'silver', 'gold')),
  position VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  matches TEXT[] DEFAULT '{}',
  friends_list TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues Table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  operating_hours JSONB NOT NULL DEFAULT '{"opening_time": "06:00", "closing_time": "23:00"}',
  cancellation_cutoff_hours INTEGER DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  match_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts Table
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  sport_type VARCHAR(50) NOT NULL,
  court_number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Rules Table
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  time_period VARCHAR(20) CHECK (time_period IN ('morning', 'afternoon', 'evening')) NOT NULL,
  day_type VARCHAR(10) CHECK (day_type IN ('weekday', 'weekend')) NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, time_period, day_type)
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
  host_player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booker_name VARCHAR(255),
  booker_contact VARCHAR(10),
  date DATE NOT NULL,
  time_slots TEXT[] NOT NULL,
  sport_type VARCHAR(50) NOT NULL,
  match_type VARCHAR(20) CHECK (match_type IN ('casual', 'challenge')) DEFAULT 'casual',
  match_status VARCHAR(20) CHECK (match_status IN ('upcoming', 'played')) DEFAULT 'upcoming',
  players_list JSONB DEFAULT '[]',
  price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
  payment_method VARCHAR(10) CHECK (payment_method IN ('cash', 'qr')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_config JSONB,
  is_recurring_instance BOOLEAN DEFAULT FALSE,
  parent_match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  cancellation_allowed_until TIMESTAMP WITH TIME ZONE,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_contact_type ON profiles(contact_number, profile_type);
CREATE INDEX idx_profiles_type ON profiles(profile_type);
CREATE INDEX idx_venues_owner ON venues(owner_admin_id);
CREATE INDEX idx_courts_venue ON courts(venue_id);
CREATE INDEX idx_matches_venue_date ON matches(venue_id, date);
CREATE INDEX idx_matches_court_date ON matches(court_id, date);
CREATE INDEX idx_matches_host ON matches(host_player_id);
CREATE INDEX idx_matches_date_status ON matches(date, match_status);

-- Row Level Security Policies

-- Profiles: Users can view their own profile, admins can view all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Venues: Public read, owners can manage
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view venues"
  ON venues FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Owners can update venues"
  ON venues FOR UPDATE
  USING (auth.uid() = owner_admin_id);

CREATE POLICY "Admins can insert venues"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND profile_type = 'admin'
    )
  );

-- Courts: Public read, venue owners can manage
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courts"
  ON courts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Venue owners can manage courts"
  ON courts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_id AND owner_admin_id = auth.uid()
    )
  );

-- Pricing Rules: Public read, venue owners can manage
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing"
  ON pricing_rules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Venue owners can manage pricing"
  ON pricing_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_id AND owner_admin_id = auth.uid()
    )
  );

-- Matches: Players can view their matches, venue owners can view all for their venue
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = host_player_id OR
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(players_list) AS player
      WHERE (player->>'player_id')::UUID = auth.uid()
    )
  );

CREATE POLICY "Venue owners can view all matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_id AND owner_admin_id = auth.uid()
    )
  );

CREATE POLICY "Players can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = host_player_id);

CREATE POLICY "Players and venue owners can update matches"
  ON matches FOR UPDATE
  USING (
    auth.uid() = host_player_id OR
    EXISTS (
      SELECT 1 FROM venues
      WHERE id = venue_id AND owner_admin_id = auth.uid()
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment to insert sample data

/*
-- Sample Admin Profile
INSERT INTO profiles (id, contact_number, profile_type, name, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', '9999999999', 'admin', 'Admin User', 'admin@maidaan.com');

-- Sample Venue
INSERT INTO venues (id, owner_admin_id, name, description, location, operating_hours, amenities)
VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Velocity Sports Hub', 'Premier sports facility', 'Mumbai, India',
   '{"opening_time": "06:00", "closing_time": "23:00"}',
   ARRAY['parking', 'changing-room', 'water', 'first-aid']);

-- Sample Courts
INSERT INTO courts (venue_id, sport_type, court_number, name, icon)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'basketball', 1, 'Basketball - Court 1', '🏀'),
  ('00000000-0000-0000-0000-000000000002', 'basketball', 2, 'Basketball - Court 2', '🏀'),
  ('00000000-0000-0000-0000-000000000002', 'volleyball', 1, 'Volleyball - Court 1', '🏐');

-- Sample Pricing Rules
INSERT INTO pricing_rules (venue_id, time_period, day_type, price_per_hour)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'morning', 'weekday', 800),
  ('00000000-0000-0000-0000-000000000002', 'afternoon', 'weekday', 1000),
  ('00000000-0000-0000-0000-000000000002', 'evening', 'weekday', 1500),
  ('00000000-0000-0000-0000-000000000002', 'morning', 'weekend', 1000),
  ('00000000-0000-0000-0000-000000000002', 'afternoon', 'weekend', 1200),
  ('00000000-0000-0000-0000-000000000002', 'evening', 'weekend', 1800);
*/
