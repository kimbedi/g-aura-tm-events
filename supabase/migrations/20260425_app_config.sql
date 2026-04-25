-- Generic key/value config table for platform-wide settings the super_admin
-- can tune from the dashboard (e.g. the commission debt threshold).

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read/write through anon/authenticated clients.
-- The server-side admin client bypasses RLS via the service-role key anyway.
DROP POLICY IF EXISTS "Super admins manage app config" ON public.app_config;
CREATE POLICY "Super admins manage app config"
  ON public.app_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- Seed the debt threshold (USD) used by checkPlatformLockStatus.
INSERT INTO public.app_config (key, value)
VALUES ('debt_limit_usd', '100'::jsonb)
ON CONFLICT (key) DO NOTHING;
