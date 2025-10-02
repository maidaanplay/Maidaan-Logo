-- Schema Updates for Maidaan Platform
-- Run this in your Supabase SQL Editor to update existing schema

-- First, update existing data: convert old skill levels to new format
UPDATE profiles SET skill_level = 'beginner' WHERE skill_level = 'bronze';
UPDATE profiles SET skill_level = 'intermediate' WHERE skill_level = 'silver';
UPDATE profiles SET skill_level = 'expert' WHERE skill_level = 'gold';

-- Now update the constraint
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_skill_level_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_skill_level_check
  CHECK (skill_level IN ('beginner', 'intermediate', 'expert', 'pro'));

-- Add missing fields to venues
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'Cancellations allowed up to 2 hours before the match',
  ADD COLUMN IF NOT EXISTS geolocation_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS geolocation_lng DECIMAL(11, 8);

-- Add missing fields to courts
ALTER TABLE courts
  ADD COLUMN IF NOT EXISTS surface_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS is_lit BOOLEAN DEFAULT true;

-- Add missing fields to matches
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  ADD COLUMN IF NOT EXISTS recurring_booking_id UUID,
  ADD COLUMN IF NOT EXISTS skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'expert', 'pro'));

-- Create sports static table
CREATE TABLE IF NOT EXISTS sports (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create amenities static table
CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sports
INSERT INTO sports (id, name, icon_name) VALUES
  ('basketball', 'Basketball', 'Dribbble'),
  ('football', 'Football', 'Goal'),
  ('tennis', 'Tennis', 'Trophy'),
  ('badminton', 'Badminton', 'Wind'),
  ('volleyball', 'Volleyball', 'CircleDot'),
  ('cricket', 'Cricket', 'Target')
ON CONFLICT (id) DO NOTHING;

-- Insert default amenities
INSERT INTO amenities (id, name, icon_name) VALUES
  ('parking', 'Parking', 'Car'),
  ('changing-room', 'Changing Room', 'Home'),
  ('water', 'Drinking Water', 'Droplet'),
  ('first-aid', 'First Aid', 'Heart'),
  ('locker', 'Lockers', 'Lock'),
  ('shower', 'Showers', 'Droplets'),
  ('cafe', 'Cafe', 'Coffee'),
  ('wifi', 'WiFi', 'Wifi')
ON CONFLICT (id) DO NOTHING;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_matches_day_of_week ON matches(day_of_week) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_matches_recurring_booking ON matches(recurring_booking_id);
CREATE INDEX IF NOT EXISTS idx_venues_geolocation ON venues(geolocation_lat, geolocation_lng) WHERE geolocation_lat IS NOT NULL;

COMMENT ON TABLE profiles IS 'User profiles for both admins and players';
COMMENT ON TABLE venues IS 'Sports venues owned by admins';
COMMENT ON TABLE courts IS 'Individual courts within venues';
COMMENT ON TABLE pricing_rules IS 'Dynamic pricing based on time and day';
COMMENT ON TABLE matches IS 'Bookings and matches at venues';
COMMENT ON TABLE sports IS 'Static list of supported sports';
COMMENT ON TABLE amenities IS 'Static list of venue amenities';
