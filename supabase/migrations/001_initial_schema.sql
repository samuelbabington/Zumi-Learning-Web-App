-- ============================================================
-- ZUMI — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy text matching
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- accent-insensitive search

-- ============================================================
-- SCHOOLS
-- ============================================================

CREATE TABLE IF NOT EXISTS schools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name       TEXT NOT NULL,
  normalized_name     TEXT NOT NULL,
  country             TEXT NOT NULL,
  city                TEXT NOT NULL,
  institution_type    TEXT NOT NULL DEFAULT 'University',
  website             TEXT,
  logo_url            TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school_aliases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  alias            TEXT NOT NULL,
  normalized_alias TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS school_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_name   TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  country         TEXT NOT NULL,
  city            TEXT NOT NULL,
  institution_type TEXT NOT NULL DEFAULT 'University',
  website         TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school_memberships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id         UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  membership_status TEXT NOT NULL DEFAULT 'active',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes for school search
CREATE INDEX IF NOT EXISTS idx_schools_normalized     ON schools USING gin(normalized_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_official_name  ON schools USING gin(official_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_country        ON schools(country);
CREATE INDEX IF NOT EXISTS idx_schools_verification   ON schools(verification_status);
CREATE INDEX IF NOT EXISTS idx_aliases_normalized     ON school_aliases USING gin(normalized_alias gin_trgm_ops);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username              TEXT UNIQUE,
  full_name             TEXT,
  avatar_url            TEXT,
  avatar_config         JSONB,
  school_id             UUID REFERENCES schools(id) ON DELETE SET NULL,
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
  date_of_birth         DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username  ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp        ON profiles(xp DESC);

-- Auto-create profile on sign-up
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

-- ============================================================
-- XP & REWARDS
-- ============================================================

CREATE TABLE IF NOT EXISTS xp_transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  game_type  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_user_id    ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_created_at ON xp_transactions(created_at DESC);

CREATE TABLE IF NOT EXISTS achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Server-side XP award with level recalculation
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT, p_game_type TEXT DEFAULT NULL)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  INSERT INTO xp_transactions (user_id, amount, reason, game_type)
  VALUES (p_user_id, p_amount, p_reason, p_game_type);

  UPDATE profiles
  SET xp = xp + p_amount,
      level = GREATEST(1, FLOOR(SQRT((xp + p_amount)::FLOAT / 100)) + 1)::INTEGER,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING xp INTO v_new_xp;

  RETURN v_new_xp;
END;
$$;

-- ============================================================
-- DOCUMENTS & STUDY MATERIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename          TEXT NOT NULL,
  file_type         TEXT NOT NULL,
  storage_path      TEXT NOT NULL,
  file_size         BIGINT NOT NULL DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_sections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title            TEXT,
  content          TEXT NOT NULL,
  section_order    INTEGER NOT NULL DEFAULT 0,
  source_reference TEXT
);

CREATE TABLE IF NOT EXISTS study_decks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  description        TEXT,
  subject            TEXT,
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  card_count         INTEGER NOT NULL DEFAULT 0,
  is_public          BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id          UUID NOT NULL REFERENCES study_decks(id) ON DELETE CASCADE,
  front            TEXT NOT NULL,
  back             TEXT NOT NULL,
  source_reference TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'intermediate',
  next_review_at   TIMESTAMPTZ,
  review_interval  INTEGER NOT NULL DEFAULT 1,
  ease_factor      FLOAT NOT NULL DEFAULT 2.5,
  review_count     INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         UUID NOT NULL REFERENCES study_cards(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at  TIMESTAMPTZ,
  review_interval INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_study_decks_user_id  ON study_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_cards_deck_id  ON study_cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_study_cards_review   ON study_cards(next_review_at);

-- Auto-update card_count
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_decks SET card_count = card_count + 1, updated_at = now() WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_decks SET card_count = GREATEST(0, card_count - 1), updated_at = now() WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_card_count ON study_cards;
CREATE TRIGGER trg_card_count
  AFTER INSERT OR DELETE ON study_cards
  FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();

-- ============================================================
-- SOCIAL: FRIENDS & NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS friendships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_recipient ON friendships(recipient_id);

CREATE TABLE IF NOT EXISTS notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  related_entity_id UUID,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read) WHERE NOT is_read;

-- ============================================================
-- MULTIPLAYER: FRIEND CHALLENGES
-- ============================================================

CREATE TABLE IF NOT EXISTS friend_challenges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_data    JSONB NOT NULL,
  subject          TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'intermediate',
  deadline         TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'expired')),
  submitted_answer TEXT,
  is_correct       BOOLEAN,
  xp_awarded       INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MULTIPLAYER: GAME ROOMS
-- ============================================================

CREATE TABLE IF NOT EXISTS game_rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code  TEXT UNIQUE NOT NULL,
  game_type  TEXT NOT NULL,
  host_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    TEXT,
  status     TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_progress', 'finished', 'cancelled')),
  settings   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_players (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id   UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team      TEXT,
  score     INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS game_rounds (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  round_number  INTEGER NOT NULL,
  question_data JSONB NOT NULL,
  current_turn  UUID REFERENCES auth.users(id),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS game_answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id     UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer       TEXT NOT NULL,
  is_correct   BOOLEAN,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(round_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_game_rooms_code    ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_game_players_room  ON game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_room   ON game_rounds(room_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_aliases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_decks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_cards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_challenges   ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players        ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers        ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_self"        ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_self"        ON profiles FOR ALL     USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT  USING (true);

-- schools
DROP POLICY IF EXISTS "schools_read"            ON schools;
DROP POLICY IF EXISTS "school_aliases_read"     ON school_aliases;
DROP POLICY IF EXISTS "school_memberships_self" ON school_memberships;
DROP POLICY IF EXISTS "school_submissions_self" ON school_submissions;
CREATE POLICY "schools_read"            ON schools            FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "school_aliases_read"     ON school_aliases     FOR SELECT USING (true);
CREATE POLICY "school_memberships_self" ON school_memberships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "school_submissions_self" ON school_submissions FOR ALL USING (auth.uid() = submitted_by) WITH CHECK (auth.uid() = submitted_by);

-- documents & decks
DROP POLICY IF EXISTS "documents_self"        ON documents;
DROP POLICY IF EXISTS "document_sections_self" ON document_sections;
DROP POLICY IF EXISTS "study_decks_self"      ON study_decks;
DROP POLICY IF EXISTS "study_cards_self"      ON study_cards;
DROP POLICY IF EXISTS "card_reviews_self"     ON card_reviews;
CREATE POLICY "documents_self"         ON documents         FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "document_sections_self" ON document_sections FOR ALL USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND d.user_id = auth.uid()));
CREATE POLICY "study_decks_self"       ON study_decks       FOR ALL USING (auth.uid() = user_id OR is_public) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_cards_self"       ON study_cards       FOR ALL USING (EXISTS (SELECT 1 FROM study_decks d WHERE d.id = deck_id AND (d.user_id = auth.uid() OR d.is_public)));
CREATE POLICY "card_reviews_self"      ON card_reviews      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XP & achievements
DROP POLICY IF EXISTS "xp_self"           ON xp_transactions;
DROP POLICY IF EXISTS "achievements_self" ON achievements;
CREATE POLICY "xp_self"           ON xp_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "achievements_self" ON achievements     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Friendships
DROP POLICY IF EXISTS "friendships_parties" ON friendships;
CREATE POLICY "friendships_parties" ON friendships FOR ALL USING (auth.uid() = requester_id OR auth.uid() = recipient_id) WITH CHECK (auth.uid() = requester_id);

-- Notifications
DROP POLICY IF EXISTS "notifications_self" ON notifications;
CREATE POLICY "notifications_self" ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Friend challenges
DROP POLICY IF EXISTS "challenges_parties" ON friend_challenges;
CREATE POLICY "challenges_parties" ON friend_challenges FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id) WITH CHECK (auth.uid() = sender_id);

-- Game rooms
DROP POLICY IF EXISTS "game_rooms_read"   ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_host"   ON game_rooms;
DROP POLICY IF EXISTS "game_players_self" ON game_players;
DROP POLICY IF EXISTS "game_rounds_read"  ON game_rounds;
DROP POLICY IF EXISTS "game_answers_self" ON game_answers;
CREATE POLICY "game_rooms_read"   ON game_rooms   FOR SELECT USING (true);
CREATE POLICY "game_rooms_host"   ON game_rooms   FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "game_players_self" ON game_players FOR ALL    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "game_rounds_read"  ON game_rounds  FOR SELECT USING (EXISTS (SELECT 1 FROM game_players gp WHERE gp.room_id = game_rounds.room_id AND gp.user_id = auth.uid()));
CREATE POLICY "game_answers_self" ON game_answers FOR ALL    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REALTIME
-- Enable Realtime for these tables via:
-- Supabase Dashboard → Database → Replication → Tables
-- Toggle on: notifications, game_rooms, game_players, game_rounds, friend_challenges
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE game_rounds;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE friend_challenges;
EXCEPTION WHEN others THEN NULL; END $$;
