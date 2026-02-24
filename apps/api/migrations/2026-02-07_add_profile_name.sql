-- Add name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name VARCHAR;
