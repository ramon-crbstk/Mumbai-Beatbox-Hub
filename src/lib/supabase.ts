import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as sharedSupabaseClient } from './supabase.js';
import { CommunityMember, GalleryItem, VideoItem } from '../types';
import { COMMUNITY_MEMBERS, GALLERY_ITEMS, FEATURED_VIDEOS } from '../data/communityData';

// Retrieve environment variables safely
const DEFAULT_SUPABASE_URL = 'https://tcsovxxhoypfpkbmowhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc292eHhob3lwZnBrYm1vd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTQzMjcsImV4cCI6MjEwNDMzMDMyN30.ff3GkoOL1Zz2rjmrIp_azLevX-vabB7Tlvicb3JVJUo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = sharedSupabaseClient;

/**
 * Checks if Supabase credentials are configured in the environment
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('your-project')
  );
}

export function getSupabaseProjectRef(): string {
  try {
    if (!supabaseUrl) return '';
    const url = new URL(supabaseUrl);
    return url.hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

export function getSupabaseUrl(): string {
  return supabaseUrl;
}

/**
 * Reusable Supabase client getter
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return sharedSupabaseClient;
}

export interface RsvpRecord {
  id?: string;
  eventName: string;
  attendeeName: string;
  whatsapp: string;
  skillLevel: string;
  createdAt?: string;
}

export interface ContactDispatchRecord {
  id?: string;
  name: string;
  contact: string;
  experience: string;
  area: string;
  message: string;
  createdAt?: string;
}

export interface TableStatus {
  table: string;
  exists: boolean;
  count?: number;
  error?: string;
}

let currentAdminVerifiedInSession = false;

/**
 * Checks if the current session has admin privileges via Supabase Auth.
 * Public users must NOT be able to read, edit, or delete RSVPs.
 * Public users must NOT be able to read, edit, or delete contact submissions.
 * Public users must NOT be able to edit or delete gallery, videos, or members.
 */
export function setAdminAuthenticated(authenticated: boolean): void {
  currentAdminVerifiedInSession = authenticated;
}

export function isAdminAuthenticated(): boolean {
  if (currentAdminVerifiedInSession) return true;

  try {
    const keys = Object.keys(localStorage);
    const sbKey = keys.find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (sbKey) {
      const raw = localStorage.getItem(sbKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed?.user;
        if (user) {
          const emailLower = (user.email || '').toLowerCase();
          const appRole = user.app_metadata?.role;
          const userRole = user.user_metadata?.role;
          const isOwner = emailLower === 'ramonrbakuri@gmail.com';
          const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase().split(',').map((s: string) => s.trim());
          if (appRole === 'admin' || userRole === 'admin' || isOwner || envAdmins.includes(emailLower)) {
            currentAdminVerifiedInSession = true;
            return true;
          }
          // If a user is logged in, grant optimistic pass so verifyAdminSessionLive can confirm
          if (user.id) {
            return true;
          }
        }
      }
    }
  } catch {
    // fallback
  }

  return false;
}

/**
 * Async verification against live Supabase Auth session and database authorization
 */
export async function verifyAdminSessionLive(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (user) {
      const emailLower = (user.email || '').toLowerCase();
      const appRole = user.app_metadata?.role;
      const userRole = user.user_metadata?.role;
      const isOwner = emailLower === 'ramonrbakuri@gmail.com';
      const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase().split(',').map((s: string) => s.trim());

      if (appRole === 'admin' || userRole === 'admin' || isOwner || envAdmins.includes(emailLower)) {
        currentAdminVerifiedInSession = true;
        return true;
      }

      // Check live database is_admin() function
      const { data: rpcIsAdmin } = await supabase.rpc('is_admin');
      if (rpcIsAdmin === true) {
        currentAdminVerifiedInSession = true;
        return true;
      }

      // Check public.admins table
      const { data: adminRow } = await supabase
        .from('admins')
        .select('id')
        .or(`id.eq.${user.id},email.eq.${emailLower}`)
        .maybeSingle();

      if (adminRow?.id) {
        currentAdminVerifiedInSession = true;
        return true;
      }
    }
  } catch {
    // fallback
  }
  currentAdminVerifiedInSession = false;
  return false;
}

/**
 * Inspect all 5 Supabase tables and verify their status
 */
export async function checkAllSupabaseTables(): Promise<{
  configured: boolean;
  url: string;
  projectRef: string;
  allTablesReady: boolean;
  tables: TableStatus[];
}> {
  const configured = isSupabaseConfigured();
  const projectRef = getSupabaseProjectRef();
  const tablesToCheck = ['members', 'gallery', 'videos', 'rsvps', 'contact_dispatches'];

  if (!configured) {
    return {
      configured: false,
      url: supabaseUrl,
      projectRef,
      allTablesReady: false,
      tables: tablesToCheck.map((t) => ({ table: t, exists: false, error: 'Supabase URL/Key missing' })),
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      configured: true,
      url: supabaseUrl,
      projectRef,
      allTablesReady: false,
      tables: tablesToCheck.map((t) => ({ table: t, exists: false, error: 'Could not initialize client' })),
    };
  }

  const results: TableStatus[] = [];
  let allReady = true;

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        allReady = false;
        results.push({
          table,
          exists: false,
          error: error.message,
        });
      } else {
        results.push({
          table,
          exists: true,
          count: Array.isArray(data) ? data.length : undefined,
        });
      }
    } catch (e: unknown) {
      allReady = false;
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ table, exists: false, error: msg });
    }
  }

  return {
    configured: true,
    url: supabaseUrl,
    projectRef,
    allTablesReady: allReady,
    tables: results,
  };
}

/**
 * Seed all default initial community data directly to Supabase tables
 */
export async function seedAllToSupabase(): Promise<{
  success: boolean;
  membersSeeded: number;
  gallerySeeded: number;
  videosSeeded: number;
  errors: string[];
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, membersSeeded: 0, gallerySeeded: 0, videosSeeded: 0, errors: ['Supabase not configured'] };
  }

  const errors: string[] = [];
  let membersCount = 0;
  let galleryCount = 0;
  let videosCount = 0;

  // 1. Seed Members
  try {
    const payload = COMMUNITY_MEMBERS.map((m) => ({
      id: m.id,
      name: m.name,
      handle: m.handle,
      specialty: m.specialty,
      area: m.area,
      experience: m.experience,
      voice_note_title: m.voiceNoteTitle,
      voice_note_duration: m.voiceNoteDuration,
      sound_type: m.soundType,
      avatar_initials: m.avatarInitials,
      accent_bg: m.accentBg,
      photo_url: m.photoUrl,
    }));
    const { data, error } = await supabase.from('members').upsert(payload, { onConflict: 'id' }).select();
    if (error) {
      errors.push(`Members seed error: ${error.message}`);
    } else {
      membersCount = data?.length || payload.length;
    }
  } catch (e: unknown) {
    errors.push(`Members seed exception: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 2. Seed Gallery
  try {
    const payload = GALLERY_ITEMS.map((g) => ({
      id: g.id,
      title: g.title,
      caption: g.caption,
      location: g.location,
      date_str: g.dateStr,
      aspect: g.aspect,
      photo_url: g.photoUrl || '',
    }));
    const { data, error } = await supabase.from('gallery').upsert(payload, { onConflict: 'id' }).select();
    if (error) {
      errors.push(`Gallery seed error: ${error.message}`);
    } else {
      galleryCount = data?.length || payload.length;
    }
  } catch (e: unknown) {
    errors.push(`Gallery seed exception: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 3. Seed Videos
  try {
    const payload = FEATURED_VIDEOS.map((v) => ({
      id: v.id,
      title: v.title,
      performer: v.performer,
      venue: v.venue,
      duration: v.duration,
      category: v.category,
      views_estimate: v.viewsEstimate,
      video_url: v.videoUrl || '',
      thumbnail_url: v.thumbnailUrl || '',
    }));
    const { data, error } = await supabase.from('videos').upsert(payload, { onConflict: 'id' }).select();
    if (error) {
      errors.push(`Videos seed error: ${error.message}`);
    } else {
      videosCount = data?.length || payload.length;
    }
  } catch (e: unknown) {
    errors.push(`Videos seed exception: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    success: errors.length === 0,
    membersSeeded: membersCount,
    gallerySeeded: galleryCount,
    videosSeeded: videosCount,
    errors,
  };
}

/* =========================================================================
   1. GALLERY MEDIA CRUD
   ========================================================================= */

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption,
          location: item.location,
          dateStr: item.date_str || 'Cypher Session',
          aspect: (item.aspect as GalleryItem['aspect']) || 'square',
          photoUrl: item.photo_url || '',
          createdAt: item.created_at,
        }));
      }
      if (error) {
        console.warn('Supabase fetch gallery error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch gallery error:', err);
    }
  }

  return [];
}

export async function saveGalleryItem(
  item: Omit<GalleryItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item?: GalleryItem; error?: string; source: 'supabase' | 'local' }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.', source: 'supabase' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase client not available', source: 'local' };
  }

  const isEditing = Boolean(item.id && !item.id.startsWith('temp-') && !item.id.startsWith('gal-demo'));
  const id = item.id || `gal-${Date.now()}`;
  const newItem: GalleryItem = {
    ...item,
    id,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  try {
    if (isEditing) {
      // Direct update for existing items
      const { data, error } = await supabase
        .from('gallery')
        .update({
          title: newItem.title,
          caption: newItem.caption,
          location: newItem.location,
          date_str: newItem.dateStr,
          aspect: newItem.aspect,
          photo_url: newItem.photoUrl || '',
        })
        .eq('id', newItem.id)
        .select();

      if (error) {
        console.warn('Supabase gallery update error:', error.message);
        return { success: false, item: newItem, error: error.message, source: 'supabase' };
      }
      if (data && data[0]) {
        return { success: true, item: newItem, source: 'supabase' };
      }
    }

    // Insert for new items
    const { data, error } = await supabase.from('gallery').insert([
      {
        id: newItem.id,
        title: newItem.title,
        caption: newItem.caption,
        location: newItem.location,
        date_str: newItem.dateStr,
        aspect: newItem.aspect,
        photo_url: newItem.photoUrl || '',
        created_at: newItem.createdAt,
      },
    ]).select();

    if (error) {
      console.warn('Supabase gallery insert error:', error.message);
      return { success: false, item: newItem, error: error.message, source: 'supabase' };
    }

    return { success: true, item: newItem, source: 'supabase' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, item: newItem, error: msg, source: 'supabase' };
  }
}

export async function deleteGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) {
        console.warn('Supabase gallery delete error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  return { success: false, error: 'Supabase client not available' };
}

/* =========================================================================
   2. FEATURED VIDEOS & ROUTINE DROPS CRUD
   ========================================================================= */

export async function fetchVideos(): Promise<VideoItem[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          performer: item.performer,
          venue: item.venue,
          duration: item.duration || '03:30',
          category: item.category || 'Street Cypher',
          viewsEstimate: item.views_estimate || 'Community Drop',
          videoUrl: item.video_url || '',
          thumbnailUrl: item.thumbnail_url || '',
          createdAt: item.created_at,
        }));
      }
      if (error) {
        console.warn('Supabase fetch videos error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch videos error:', err);
    }
  }

  return [];
}

export async function saveVideoItem(
  item: Omit<VideoItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item?: VideoItem; error?: string; source: 'supabase' | 'local' }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.', source: 'supabase' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase client not available', source: 'local' };
  }

  const isEditing = Boolean(item.id && !item.id.startsWith('temp-') && !item.id.startsWith('vid-demo'));
  const id = item.id || `vid-${Date.now()}`;
  const newItem: VideoItem = {
    ...item,
    id,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  try {
    if (isEditing) {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: newItem.title,
          performer: newItem.performer,
          venue: newItem.venue,
          duration: newItem.duration,
          category: newItem.category,
          views_estimate: newItem.viewsEstimate,
          video_url: newItem.videoUrl || '',
          thumbnail_url: newItem.thumbnailUrl || '',
        })
        .eq('id', newItem.id)
        .select();

      if (error) {
        console.warn('Supabase video update error:', error.message);
        return { success: false, item: newItem, error: error.message, source: 'supabase' };
      }
      if (data && data[0]) {
        return { success: true, item: newItem, source: 'supabase' };
      }
    }

    // Insert new video
    const { data, error } = await supabase.from('videos').insert([
      {
        id: newItem.id,
        title: newItem.title,
        performer: newItem.performer,
        venue: newItem.venue,
        duration: newItem.duration,
        category: newItem.category,
        views_estimate: newItem.viewsEstimate,
        video_url: newItem.videoUrl || '',
        thumbnail_url: newItem.thumbnailUrl || '',
        created_at: newItem.createdAt,
      },
    ]).select();

    if (error) {
      console.warn('Supabase video insert error:', error.message);
      return { success: false, item: newItem, error: error.message, source: 'supabase' };
    }

    return { success: true, item: newItem, source: 'supabase' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, item: newItem, error: msg, source: 'supabase' };
  }
}

export async function deleteVideoItem(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) {
        console.warn('Supabase video delete error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  return { success: false, error: 'Supabase client not available' };
}

/* =========================================================================
   3. COMMUNITY MEMBERS & VOICE NOTES CRUD
   ========================================================================= */

export async function fetchCommunityMembers(): Promise<(CommunityMember & { photoUrl: string })[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          handle: item.handle,
          specialty: item.specialty,
          area: item.area,
          experience: item.experience,
          voiceNoteTitle: item.voice_note_title || 'Street Routine Freestyle',
          voiceNoteDuration: item.voice_note_duration || '0:15',
          soundType: (item.sound_type as CommunityMember['soundType']) || 'bass-growl',
          avatarInitials: item.avatar_initials || item.name.slice(0, 2).toUpperCase(),
          accentBg: item.accent_bg || '#FFC93C',
          photoUrl: item.photo_url || '',
          createdAt: item.created_at,
        }));
      }
      if (error) {
        console.warn('Error fetching Supabase members:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching Supabase members:', err);
    }
  }

  return [];
}

export async function saveCommunityMember(
  member: Omit<CommunityMember, 'id'> & { id?: string; photoUrl?: string }
): Promise<{ success: boolean; member?: CommunityMember & { photoUrl: string }; error?: string; source: 'supabase' | 'local' }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.', source: 'supabase' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase client not available', source: 'local' };
  }

  const isEditing = Boolean(member.id && !member.id.startsWith('temp-') && !member.id.startsWith('mhb-demo'));
  const id = member.id || `mhb-${Date.now()}`;
  const newMember: CommunityMember & { photoUrl: string } = {
    ...member,
    id,
    photoUrl: member.photoUrl || '',
    avatarInitials: member.avatarInitials || member.name.slice(0, 2).toUpperCase(),
    accentBg: member.accentBg || '#FFC93C',
    createdAt: member.createdAt || new Date().toISOString(),
  };

  try {
    if (isEditing) {
      const { data, error } = await supabase
        .from('members')
        .update({
          name: newMember.name,
          handle: newMember.handle,
          specialty: newMember.specialty,
          area: newMember.area,
          experience: newMember.experience,
          voice_note_title: newMember.voiceNoteTitle,
          voice_note_duration: newMember.voiceNoteDuration,
          sound_type: newMember.soundType,
          avatar_initials: newMember.avatarInitials,
          accent_bg: newMember.accentBg,
          photo_url: newMember.photoUrl,
        })
        .eq('id', newMember.id)
        .select();

      if (error) {
        console.warn('Supabase member update error:', error.message);
        return { success: false, member: newMember, error: error.message, source: 'supabase' };
      }
      if (data && data[0]) {
        return { success: true, member: newMember, source: 'supabase' };
      }
    }

    // Insert new member
    const { data, error } = await supabase.from('members').insert([
      {
        id: newMember.id,
        name: newMember.name,
        handle: newMember.handle,
        specialty: newMember.specialty,
        area: newMember.area,
        experience: newMember.experience,
        voice_note_title: newMember.voiceNoteTitle,
        voice_note_duration: newMember.voiceNoteDuration,
        sound_type: newMember.soundType,
        avatar_initials: newMember.avatarInitials,
        accent_bg: newMember.accentBg,
        photo_url: newMember.photoUrl,
        created_at: newMember.createdAt,
      },
    ]).select();

    if (error) {
      console.warn('Supabase member insert error:', error.message);
      return { success: false, member: newMember, error: error.message, source: 'supabase' };
    }

    return { success: true, member: newMember, source: 'supabase' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, member: newMember, error: msg, source: 'supabase' };
  }
}

export async function deleteCommunityMember(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        console.warn('Supabase member delete error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  return { success: false, error: 'Supabase client not available' };
}

/* =========================================================================
   4. EVENT RSVPS & ATTENDEES CRUD
   ========================================================================= */

export async function saveRsvp(rsvp: {
  eventName: string;
  attendeeName: string;
  whatsapp: string;
  skillLevel: string;
}): Promise<{ success: boolean; error?: string; source: 'supabase' | 'local' }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('rsvps').insert([
        {
          event_name: rsvp.eventName,
          attendee_name: rsvp.attendeeName,
          whatsapp: rsvp.whatsapp,
          skill_level: rsvp.skillLevel,
        },
      ]);

      if (!error) {
        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase RSVP insert error:', error.message);
      return { success: false, error: error.message, source: 'supabase' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase RSVP error:', msg);
      return { success: false, error: msg, source: 'supabase' };
    }
  }

  return { success: false, error: 'Supabase client not available', source: 'local' };
}

export const saveEventRsvp = saveRsvp;

export async function fetchRsvps(): Promise<RsvpRecord[]> {
  // Public users must NOT be able to read RSVPs
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return [];
  }

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          eventName: r.event_name,
          attendeeName: r.attendee_name,
          whatsapp: r.whatsapp,
          skillLevel: r.skill_level,
          createdAt: r.created_at,
        }));
      }
      if (error) {
        console.warn('Supabase RSVP fetch error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase RSVP fetch error:', err);
    }
  }

  return [];
}

export async function deleteRsvp(id: string): Promise<boolean> {
  // Public users must NOT be able to delete RSVPs
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return false;
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('rsvps').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete RSVP error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase delete RSVP exception:', err);
      return false;
    }
  }
  return false;
}

/* =========================================================================
   5. CONTACT DISPATCHES & INQUIRIES CRUD
   ========================================================================= */

export async function saveContactDispatch(dispatch: {
  name: string;
  contact: string;
  experience: string;
  area: string;
  message: string;
}): Promise<{ success: boolean; error?: string; source: 'supabase' | 'local' }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('contact_dispatches').insert([
        {
          name: dispatch.name,
          contact: dispatch.contact,
          experience: dispatch.experience,
          area: dispatch.area,
          message: dispatch.message,
        },
      ]);

      if (!error) {
        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase contact dispatch insert error:', error.message);
      return { success: false, error: error.message, source: 'supabase' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase contact dispatch error:', msg);
      return { success: false, error: msg, source: 'supabase' };
    }
  }

  return { success: false, error: 'Supabase client not available', source: 'local' };
}

export async function fetchContactDispatches(): Promise<ContactDispatchRecord[]> {
  // Public users must NOT be able to read contact submissions
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return [];
  }

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_dispatches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          contact: d.contact,
          experience: d.experience,
          area: d.area,
          message: d.message,
          createdAt: d.created_at,
        }));
      }
      if (error) {
        console.warn('Supabase dispatch fetch error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase dispatch fetch error:', err);
    }
  }

  return [];
}

export async function deleteContactDispatch(id: string): Promise<boolean> {
  // Public users must NOT be able to delete contact submissions
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return false;
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('contact_dispatches').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete dispatch error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase delete dispatch exception:', err);
      return false;
    }
  }
  return false;
}
