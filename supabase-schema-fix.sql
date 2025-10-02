-- Fix skill level constraint issue
-- Run this FIRST to fix the constraint

-- Step 1: Drop the old constraint completely
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_skill_level_check;

-- Step 2: Update all existing data
UPDATE profiles SET skill_level = 'beginner' WHERE skill_level = 'bronze';
UPDATE profiles SET skill_level = 'intermediate' WHERE skill_level = 'silver';
UPDATE profiles SET skill_level = 'expert' WHERE skill_level = 'gold';

-- Step 3: Add the new constraint (make it nullable-aware)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_skill_level_check
  CHECK (skill_level IS NULL OR skill_level IN ('beginner', 'intermediate', 'expert', 'pro'));
