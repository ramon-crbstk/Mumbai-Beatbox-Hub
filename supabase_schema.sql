-- Mumbai Beatbox Hub - Complete Production Supabase Database Schema & RLS Policies
-- Execute this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tcsovxxhoypfpkbmowhd/sql

-- ============================================================================
-- 1. ADMIN USERS TABLE & AUTHORIZATION RPC
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view admins if they are in the admin table
DROP POLICY IF EXISTS "Allow admins to view admin list" ON public.admins;
CREATE POLICY "Allow admins to view admin list" ON public.admins
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR email = (auth.jwt() ->> 'email'));

-- Helper function to check if the current user is an admin
-- Written in plpgsql with SECURITY DEFINER and explicit search_path to prevent query-planner inlining
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
    -- Check 1: Direct match by authenticated user UUID against public.admins.id
    IF auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admins WHERE id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check 2: Match by authenticated JWT email claim against public.admins.email (case-insensitive)
    IF auth.jwt() ->> 'email' IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE lower(email) = lower(auth.jwt() ->> 'email')
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check 3: Check app_metadata or user_metadata admin role in JWT
    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
       OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
       OR (auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Seed project owner into public.admins (from auth.users with case-insensitive email match)
INSERT INTO public.admins (id, email)
SELECT id, email
FROM auth.users
WHERE lower(email) = lower('ramonrbakuri@gmail.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Grant required table privileges to authenticated and anon roles so RLS policies can evaluate
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON TABLE public.admins TO authenticated;
GRANT ALL ON TABLE public.members TO authenticated, anon;
GRANT ALL ON TABLE public.gallery TO authenticated, anon;
GRANT ALL ON TABLE public.videos TO authenticated, anon;
GRANT ALL ON TABLE public.rsvps TO authenticated, anon;
GRANT ALL ON TABLE public.contact_dispatches TO authenticated, anon;

-- ============================================================================
-- 2. GALLERY MEDIA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY DEFAULT ('gal-' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    location TEXT NOT NULL,
    date_str TEXT DEFAULT 'Cypher Session',
    aspect TEXT DEFAULT 'square',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public gallery select" ON public.gallery;
DROP POLICY IF EXISTS "Allow admin gallery insert" ON public.gallery;
DROP POLICY IF EXISTS "Allow admin gallery update" ON public.gallery;
DROP POLICY IF EXISTS "Allow admin gallery delete" ON public.gallery;
DROP POLICY IF EXISTS "Allow public gallery insert" ON public.gallery;
DROP POLICY IF EXISTS "Allow public gallery update" ON public.gallery;
DROP POLICY IF EXISTS "Allow public gallery delete" ON public.gallery;

-- Public can view gallery
CREATE POLICY "Allow public gallery select" ON public.gallery
    FOR SELECT TO public USING (true);

-- Only authenticated admins can insert/update/delete
CREATE POLICY "Allow admin gallery insert" ON public.gallery
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin gallery update" ON public.gallery
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin gallery delete" ON public.gallery
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 3. FEATURED VIDEOS & ROUTINE DROPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY DEFAULT ('vid-' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    performer TEXT NOT NULL,
    venue TEXT NOT NULL,
    duration TEXT NOT NULL DEFAULT '03:30',
    category TEXT NOT NULL DEFAULT 'Street Cypher',
    views_estimate TEXT DEFAULT 'Community Drop',
    video_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public videos select" ON public.videos;
DROP POLICY IF EXISTS "Allow admin videos insert" ON public.videos;
DROP POLICY IF EXISTS "Allow admin videos update" ON public.videos;
DROP POLICY IF EXISTS "Allow admin videos delete" ON public.videos;
DROP POLICY IF EXISTS "Allow public videos insert" ON public.videos;
DROP POLICY IF EXISTS "Allow public videos update" ON public.videos;
DROP POLICY IF EXISTS "Allow public videos delete" ON public.videos;

-- Public can view videos
CREATE POLICY "Allow public videos select" ON public.videos
    FOR SELECT TO public USING (true);

-- Only authenticated admins can insert/update/delete
CREATE POLICY "Allow admin videos insert" ON public.videos
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin videos update" ON public.videos
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin videos delete" ON public.videos
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 4. COMMUNITY MEMBERS & VOICE NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY DEFAULT ('mhb-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    handle TEXT NOT NULL,
    specialty TEXT NOT NULL,
    area TEXT NOT NULL,
    experience TEXT NOT NULL,
    voice_note_title TEXT DEFAULT 'Street Routine Freestyle',
    voice_note_duration TEXT DEFAULT '0:15',
    sound_type TEXT DEFAULT 'bass-growl',
    avatar_initials TEXT,
    accent_bg TEXT DEFAULT '#FFC93C',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public members select" ON public.members;
DROP POLICY IF EXISTS "Allow admin members insert" ON public.members;
DROP POLICY IF EXISTS "Allow admin members update" ON public.members;
DROP POLICY IF EXISTS "Allow admin members delete" ON public.members;
DROP POLICY IF EXISTS "Allow public members insert" ON public.members;
DROP POLICY IF EXISTS "Allow public members update" ON public.members;
DROP POLICY IF EXISTS "Allow public members delete" ON public.members;

-- Public can view members
CREATE POLICY "Allow public members select" ON public.members
    FOR SELECT TO public USING (true);

-- Only authenticated admins can insert/update/delete
CREATE POLICY "Allow admin members insert" ON public.members
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin members update" ON public.members
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin members delete" ON public.members
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 5. RSVPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
    id TEXT PRIMARY KEY DEFAULT ('rsvp-' || floor(extract(epoch from now()) * 1000)::text),
    event_name TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    skill_level TEXT NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public RSVP select" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public RSVP insert" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public RSVP delete" ON public.rsvps;
DROP POLICY IF EXISTS "Allow admin RSVP select" ON public.rsvps;
DROP POLICY IF EXISTS "Allow admin RSVP delete" ON public.rsvps;

-- Public can ONLY insert RSVPs
CREATE POLICY "Allow public RSVP insert" ON public.rsvps
    FOR INSERT TO public WITH CHECK (true);

-- Only authenticated admins can read and delete RSVPs
CREATE POLICY "Allow admin RSVP select" ON public.rsvps
    FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin RSVP delete" ON public.rsvps
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 6. CONTACT DISPATCHES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contact_dispatches (
    id TEXT PRIMARY KEY DEFAULT ('disp-' || floor(extract(epoch from now()) * 1000)::text),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    experience TEXT,
    area TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_dispatches ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public contact dispatch select" ON public.contact_dispatches;
DROP POLICY IF EXISTS "Allow public contact dispatch insert" ON public.contact_dispatches;
DROP POLICY IF EXISTS "Allow public contact dispatch delete" ON public.contact_dispatches;
DROP POLICY IF EXISTS "Allow admin contact dispatch select" ON public.contact_dispatches;
DROP POLICY IF EXISTS "Allow admin contact dispatch delete" ON public.contact_dispatches;

-- Public can ONLY insert contact dispatches
CREATE POLICY "Allow public contact dispatch insert" ON public.contact_dispatches
    FOR INSERT TO public WITH CHECK (true);

-- Only authenticated admins can read and delete contact dispatches
CREATE POLICY "Allow admin contact dispatch select" ON public.contact_dispatches
    FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin contact dispatch delete" ON public.contact_dispatches
    FOR DELETE TO authenticated USING (public.is_admin());
