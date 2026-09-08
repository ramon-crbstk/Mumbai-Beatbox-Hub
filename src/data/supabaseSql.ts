export const SUPABASE_SCHEMA_SQL = `-- Mumbai Beatbox Hub (MHB) - Complete Supabase Database Schema
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
    event_name TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    skill_level TEXT NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public RSVP select" ON public.rsvps FOR SELECT TO public USING (true);
CREATE POLICY "Allow public RSVP insert" ON public.rsvps FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public RSVP delete" ON public.rsvps FOR DELETE TO public USING (true);

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
`;
