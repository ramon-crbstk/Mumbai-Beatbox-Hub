-- ============================================================================
-- MUMBAI BEATBOX HUB - COLLABORATIONS MIGRATION
-- Target Table: public.collaborations (Collaborated With // Community Roster)
-- ============================================================================
-- Execute this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tcsovxxhoypfpkbmowhd/sql

-- 1. Create table public.collaborations
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_code TEXT,
    description TEXT,
    collaboration_type TEXT,
    logo_url TEXT,
    website_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_collaborations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_collaborations_updated_at ON public.collaborations;
CREATE TRIGGER trigger_set_collaborations_updated_at
    BEFORE UPDATE ON public.collaborations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_collaborations_updated_at();

-- 3. Indexes for display order and public visibility filtering
CREATE INDEX IF NOT EXISTS idx_collaborations_display_order ON public.collaborations(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_collaborations_is_visible ON public.collaborations(is_visible);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.collaborations TO authenticated, anon;

-- 5. Clean up existing policies if re-running
DROP POLICY IF EXISTS "Allow public select visible collaborations" ON public.collaborations;
DROP POLICY IF EXISTS "Allow admin insert collaborations" ON public.collaborations;
DROP POLICY IF EXISTS "Allow admin update collaborations" ON public.collaborations;
DROP POLICY IF EXISTS "Allow admin delete collaborations" ON public.collaborations;

-- 6. Row Level Security Policies
-- Policy 1: Public SELECT - only visible records OR authenticated MHB admins
CREATE POLICY "Allow public select visible collaborations" ON public.collaborations
    FOR SELECT TO public
    USING (is_visible = true OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Policy 2: Admin INSERT - only authenticated MHB admins via public.is_admin()
CREATE POLICY "Allow admin insert collaborations" ON public.collaborations
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

-- Policy 3: Admin UPDATE - only authenticated MHB admins via public.is_admin()
CREATE POLICY "Allow admin update collaborations" ON public.collaborations
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy 4: Admin DELETE - only authenticated MHB admins via public.is_admin()
CREATE POLICY "Allow admin delete collaborations" ON public.collaborations
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 7. Seed initial community roster collaborations if table is empty
INSERT INTO public.collaborations (name, short_code, description, collaboration_type, website_url, display_order, is_visible)
VALUES
  ('Bandra Street Sound', 'BS', 'Acoustic Partner in Bandra West promenade sessions', 'Acoustic Partner', '', 1, true),
  ('Khar Cultural Warehouse', 'KC', 'Workshop and indoor training warehouse venue', 'Workshop Venue', '', 2, true),
  ('Mumbai Underground Fest', 'MU', 'Annual urban street dance and beatbox battle stage', 'Stage Partner', '', 3, true),
  ('Collegiate Hip-Hop League', 'CH', 'Inter-collegiate vocal percussion tournament circuit', 'Youth Circuit', '', 4, true),
  ('Suburban Jam Series', 'SJ', 'Monthly weekend park jam and acoustic cipher series', 'Jam Supporter', '', 5, true)
ON CONFLICT DO NOTHING;
