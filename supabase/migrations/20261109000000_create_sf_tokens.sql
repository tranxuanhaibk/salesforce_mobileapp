-- =============================================================================
-- Migration: 20261109000000_create_sf_tokens.sql
-- Purpose: Store Salesforce OAuth2 tokens managed via Supabase with RLS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sf_tokens (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  salesforce_user_id TEXT NOT NULL UNIQUE,
  instance_url       TEXT NOT NULL,
  access_token       TEXT NOT NULL,
  refresh_token      TEXT NOT NULL,
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups by salesforce_user_id and user_id
CREATE INDEX IF NOT EXISTS idx_sf_tokens_salesforce_user_id
  ON public.sf_tokens(salesforce_user_id);

CREATE INDEX IF NOT EXISTS idx_sf_tokens_user_id
  ON public.sf_tokens(user_id);

-- Automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.handle_sf_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sf_tokens_updated_at ON public.sf_tokens;
CREATE TRIGGER trg_sf_tokens_updated_at
  BEFORE UPDATE ON public.sf_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sf_tokens_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.sf_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users tied to user_id
CREATE POLICY "Users can view their own Salesforce tokens"
  ON public.sf_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Salesforce tokens"
  ON public.sf_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Salesforce tokens"
  ON public.sf_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Salesforce tokens"
  ON public.sf_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service Role has full access for server-side OAuth callback & token refresh
CREATE POLICY "Service role can manage all sf_tokens"
  ON public.sf_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
