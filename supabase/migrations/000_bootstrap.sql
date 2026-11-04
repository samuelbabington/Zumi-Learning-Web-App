-- ============================================================
-- ZUMI — Minimal Bootstrap
-- Run THIS first. It only creates what registration needs.
-- After registration works, run 001_initial_schema.sql + 002_referrals.sql
-- ============================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username              TEXT UNIQUE,
  full_name             TEXT,
  avatar_url            TEXT,
  avatar_config         JSONB,
  school_id             UUID,
  bio                   TEXT,
  xp                    INTEGER NOT NULL DEFAULT 0,
  coins                 INTEGER NOT NULL DEFAULT 0,
  level                 INTEGER NOT NULL DEFAULT 1,
  streak                INTEGER NOT NULL DEFAULT 0,
  streak_last_date      DATE,
  lives                 INTEGER NOT NULL DEFAULT 10,
  lives_last_refill     TIMESTAMPTZ,
  theme                 TEXT NOT NULL DEFAULT 'dark',
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  interests             TEXT[],
  referral_code         TEXT UNIQUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop + recreate policies
DROP POLICY IF EXISTS "profiles_self"        ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_self"        ON profiles FOR ALL    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);

-- Trigger: auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
