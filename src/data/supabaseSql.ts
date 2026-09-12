export const SUPABASE_SCHEMA_SQL = `-- Mumbai Beatbox Hub (MBH) - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. GALLERY MEDIA TABLE
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
CREATE POLICY "Allow public gallery select" ON public.gallery FOR SELECT TO public USING (true);
CREATE POLICY "Allow public gallery insert" ON public.gallery FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public gallery update" ON public.gallery FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public gallery delete" ON public.gallery FOR DELETE TO public USING (true);

-- 2. FEATURED VIDEOS & ROUTINE DROPS TABLE
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
CREATE POLICY "Allow public videos select" ON public.videos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public videos insert" ON public.videos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public videos update" ON public.videos FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public videos delete" ON public.videos FOR DELETE TO public USING (true);

-- 3. COMMUNITY MEMBERS & VOICE NOTES TABLE
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
CREATE POLICY "Allow public members select" ON public.members FOR SELECT TO public USING (true);
CREATE POLICY "Allow public members insert" ON public.members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public members update" ON public.members FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public members delete" ON public.members FOR DELETE TO public USING (true);

-- 4. RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.rsvps (
    id TEXT PRIMARY KEY DEFAULT ('rsvp-' || floor(extract(epoch from now()) * 1000)::text),
    event_id TEXT,
    event_name TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    skill_level TEXT NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS event_id TEXT;
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON public.rsvps(event_id);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public RSVP insert" ON public.rsvps FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin RSVP select" ON public.rsvps FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow admin RSVP delete" ON public.rsvps FOR DELETE TO authenticated USING (public.is_admin());

-- 5. CONTACT DISPATCHES TABLE
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
CREATE POLICY "Allow public contact dispatch select" ON public.contact_dispatches FOR SELECT TO public USING (true);
CREATE POLICY "Allow public contact dispatch insert" ON public.contact_dispatches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public contact dispatch delete" ON public.contact_dispatches FOR DELETE TO public USING (true);

-- 6. UPCOMING EVENTS & CYPHER SCHEDULE TABLE
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
CREATE POLICY "Allow public events select" ON public.events FOR SELECT TO public USING (is_published = true OR public.is_admin());
CREATE POLICY "Allow admin events insert" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin events update" ON public.events FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Allow admin events delete" ON public.events FOR DELETE TO authenticated USING (public.is_admin());

-- 7. CAPACITY AND ATOMIC RSVP RPC
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
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
    IF NOT FOUND THEN
        SELECT * INTO v_event FROM public.events WHERE lower(COALESCE(title, name, '')) = lower(p_event_name) LIMIT 1 FOR UPDATE;
        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'Event not found');
        END IF;
    END IF;

    IF v_event.is_published IS FALSE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration not available for this event');
    END IF;

    IF v_event.registration_status = 'closed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration is closed for this event');
    END IF;

    SELECT COUNT(*) INTO v_rsvp_count FROM public.rsvps WHERE event_id = v_event.id;

    IF v_event.max_people IS NOT NULL AND v_rsvp_count >= v_event.max_people THEN
        UPDATE public.events SET registration_status = 'full', updated_at = timezone('utc'::text, now()) WHERE id = v_event.id;
        RETURN jsonb_build_object('success', false, 'error', 'Slots Full', 'is_full', true);
    END IF;

    v_new_id := 'rsvp-' || floor(extract(epoch from now()) * 1000)::text;
    INSERT INTO public.rsvps (id, event_id, event_name, attendee_name, whatsapp, skill_level, created_at)
    VALUES (v_new_id, v_event.id, COALESCE(v_event.title, v_event.name, p_event_name), p_attendee_name, p_whatsapp, p_skill_level, timezone('utc'::text, now()));

    IF v_event.max_people IS NOT NULL AND (v_rsvp_count + 1) >= v_event.max_people THEN
        UPDATE public.events SET registration_status = 'full', updated_at = timezone('utc'::text, now()) WHERE id = v_event.id;
    END IF;

    RETURN jsonb_build_object('success', true, 'id', v_new_id, 'event_id', v_event.id, 'current_count', v_rsvp_count + 1, 'max_people', v_event.max_people);
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_event_rsvp(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
`;
