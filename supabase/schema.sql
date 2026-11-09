-- =============================================================
-- Salesforce Credentials Table
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================

-- Drop if re-running migration during development
DROP TABLE IF EXISTS sf_credentials;

CREATE TABLE sf_credentials (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Tokens are stored AES-256-GCM encrypted at application level.
  -- Format: "iv_hex:authTag_hex:ciphertext_hex"
  access_token  TEXT        NOT NULL,
  refresh_token TEXT        NOT NULL,
  instance_url  TEXT        NOT NULL,
  sf_user_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One Salesforce org connection per app user
  CONSTRAINT sf_credentials_user_id_unique UNIQUE (user_id)
);

-- ── Automatic updated_at trigger ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sf_credentials_updated_at
  BEFORE UPDATE ON sf_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE sf_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only read their own credentials
CREATE POLICY "sf_credentials_select_own"
  ON sf_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "sf_credentials_insert_own"
  ON sf_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "sf_credentials_update_own"
  ON sf_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "sf_credentials_delete_own"
  ON sf_credentials
  FOR DELETE
  USING (auth.uid() = user_id);
