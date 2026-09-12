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

    -- Check 4: Direct check for project owner account
    IF lower(COALESCE(auth.jwt() ->> 'email', '')) = 'ramonrbakuri@gmail.com' THEN
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
GRANT ALL ON TABLE public.events TO authenticated, anon;
GRANT ALL ON TABLE public.blogs TO authenticated, anon;

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
-- 5. RSVPS TABLE & SLOT CAPACITY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rsvps (
    id TEXT PRIMARY KEY DEFAULT ('rsvp-' || floor(extract(epoch from now()) * 1000)::text),
    event_id TEXT,
    event_name TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    skill_level TEXT NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure event_id column exists
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS event_id TEXT;
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON public.rsvps(event_id);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public RSVP select" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public RSVP insert" ON public.rsvps;
DROP POLICY IF EXISTS "Allow public RSVP delete" ON public.rsvps;
DROP POLICY IF EXISTS "Allow admin RSVP select" ON public.rsvps;
DROP POLICY IF EXISTS "Allow admin RSVP delete" ON public.rsvps;

-- Public can insert RSVPs
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

-- ============================================================================
-- 7. UPCOMING EVENTS & CYPHER SCHEDULE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT ('evt-' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT,
    name TEXT,
    slug TEXT,
    description TEXT,
    blurb TEXT,
    event_type TEXT DEFAULT 'cypher',
    date TEXT NOT NULL, -- Stored as ISO YYYY-MM-DD
    time TEXT NOT NULL DEFAULT '5:30 PM – 8:00 PM IST',
    venue TEXT NOT NULL,
    location TEXT DEFAULT 'Mumbai',
    area TEXT DEFAULT 'Mumbai',
    entry TEXT NOT NULL DEFAULT 'Free Entry / Open to all',
    cover_image_url TEXT,
    registration_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    max_people INTEGER,
    registration_status TEXT NOT NULL DEFAULT 'open' CHECK (registration_status IN ('open', 'full', 'closed')),
    is_battle_or_live BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist for existing deployments
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS blurb TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'cypher';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time TEXT DEFAULT '5:30 PM – 8:00 PM IST';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Mumbai';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'Mumbai';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entry TEXT DEFAULT 'Free Entry / Open to all';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_people INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_battle_or_live BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public events select" ON public.events;
DROP POLICY IF EXISTS "Allow admin events insert" ON public.events;
DROP POLICY IF EXISTS "Allow admin events update" ON public.events;
DROP POLICY IF EXISTS "Allow admin events delete" ON public.events;

-- Everyone can view published events
CREATE POLICY "Allow public events select" ON public.events
    FOR SELECT TO public USING (is_published = true OR public.is_admin());

-- Only admins can add, update, or remove events
CREATE POLICY "Allow admin events insert" ON public.events
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin events update" ON public.events
    FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Allow admin events delete" ON public.events
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- 8. DATABASE RPC FUNCTIONS FOR CAPACITY & SLOT ENFORCEMENT
-- ============================================================================

-- Atomic server-side RSVP submission with row-level concurrency lock
CREATE OR REPLACE FUNCTION public.submit_event_rsvp(
    p_event_id TEXT,
    p_event_name TEXT,
    p_attendee_name TEXT,
    p_whatsapp TEXT,
    p_skill_level TEXT DEFAULT 'Beginner'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event RECORD;
    v_rsvp_count INTEGER;
    v_new_id TEXT;
BEGIN
    -- 1. Lock the event row to prevent concurrent race conditions
    SELECT * INTO v_event
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        SELECT * INTO v_event
        FROM public.events
        WHERE lower(COALESCE(title, name, '')) = lower(p_event_name)
        LIMIT 1
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'Event not found');
        END IF;
    END IF;

    -- 2. Verify publication
    IF v_event.is_published IS FALSE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration not available for this event');
    END IF;

    -- 3. Verify registration is open
    IF v_event.registration_status = 'closed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration is closed for this event');
    END IF;

    -- 4. Count existing RSVPs for this event
    SELECT COUNT(*) INTO v_rsvp_count
    FROM public.rsvps
    WHERE event_id = v_event.id;

    -- 5. Capacity check: if max_people is not NULL and count >= max_people
    IF v_event.max_people IS NOT NULL AND v_rsvp_count >= v_event.max_people THEN
        UPDATE public.events 
        SET registration_status = 'full', updated_at = timezone('utc'::text, now())
        WHERE id = v_event.id;

        RETURN jsonb_build_object('success', false, 'error', 'Slots Full', 'is_full', true);
    END IF;

    -- 6. Insert the RSVP record
    v_new_id := 'rsvp-' || floor(extract(epoch from now()) * 1000)::text;
    INSERT INTO public.rsvps (id, event_id, event_name, attendee_name, whatsapp, skill_level, created_at)
    VALUES (
        v_new_id, 
        v_event.id, 
        COALESCE(v_event.title, v_event.name, p_event_name), 
        p_attendee_name, 
        p_whatsapp, 
        p_skill_level, 
        timezone('utc'::text, now())
    );

    -- 7. Update event status to 'full' if last spot was just taken
    IF v_event.max_people IS NOT NULL AND (v_rsvp_count + 1) >= v_event.max_people THEN
        UPDATE public.events 
        SET registration_status = 'full', updated_at = timezone('utc'::text, now())
        WHERE id = v_event.id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'id', v_new_id, 
        'event_id', v_event.id,
        'current_count', v_rsvp_count + 1,
        'max_people', v_event.max_people
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_event_rsvp(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- Public helper to get live RSVP counts per event without exposing attendee details
CREATE OR REPLACE FUNCTION public.get_event_rsvp_counts()
RETURNS TABLE (event_id TEXT, rsvp_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT event_id, COUNT(*) AS rsvp_count
    FROM public.rsvps
    WHERE event_id IS NOT NULL
    GROUP BY event_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_event_rsvp_counts() TO authenticated, anon;

