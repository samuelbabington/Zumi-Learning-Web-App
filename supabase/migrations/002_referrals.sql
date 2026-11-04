-- ============================================================
-- ZUMI — Referral System
-- ============================================================

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code    TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'invalid')),
  xp_awarded       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  UNIQUE(referred_id)              -- each user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer   ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code       ON referrals(referral_code);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referrals_parties" ON referrals;
DROP POLICY IF EXISTS "referrals_insert"  ON referrals;
CREATE POLICY "referrals_parties" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert"  ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Add referral_code column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Auto-generate referral code for new profiles
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID, p_username TEXT DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Use username if available, else generate random code
  IF p_username IS NOT NULL AND length(p_username) >= 3 THEN
    v_code := upper(substring(p_username, 1, 6)) || upper(substring(encode(gen_random_bytes(2), 'hex'), 1, 4));
  ELSE
    v_code := upper(encode(gen_random_bytes(4), 'hex'));
  END IF;
  RETURN v_code;
END;
$$;

-- Function: award referral XP to both parties (100 XP each)
-- Called after the referred user completes onboarding
CREATE OR REPLACE FUNCTION complete_referral(p_referred_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
BEGIN
  -- Find pending referral for this user
  SELECT id, referrer_id INTO v_referral_id, v_referrer_id
  FROM referrals
  WHERE referred_id = p_referred_id AND status = 'pending' AND NOT xp_awarded
  LIMIT 1;

  IF v_referral_id IS NULL THEN
    RETURN; -- No pending referral
  END IF;

  -- Prevent self-referral
  IF v_referrer_id = p_referred_id THEN
    UPDATE referrals SET status = 'invalid' WHERE id = v_referral_id;
    RETURN;
  END IF;

  -- Award 100 XP to referrer
  PERFORM award_xp(v_referrer_id, 100, 'Referral bonus — friend joined Zumi!', 'referral');

  -- Award 100 XP to referred user
  PERFORM award_xp(p_referred_id, 100, 'Welcome bonus — joined via referral!', 'referral');

  -- Send notifications to both
  INSERT INTO notifications (user_id, type, title, message)
  VALUES
    (v_referrer_id, 'referral_complete', '🎉 Referral bonus!', 'Your friend joined Zumi! You both earned 100 XP.'),
    (p_referred_id, 'referral_welcome',  '🎁 Welcome bonus!',  'You joined via a referral link and earned 100 XP!');

  -- Mark referral as completed
  UPDATE referrals
  SET status = 'completed', xp_awarded = true, completed_at = now()
  WHERE id = v_referral_id;
END;
$$;
