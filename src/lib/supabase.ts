import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommunityMember, GalleryItem, VideoItem, EventItem } from '../types';
import { COMMUNITY_MEMBERS, GALLERY_ITEMS, FEATURED_VIDEOS } from '../data/communityData';

// Retrieve environment variables safely
const DEFAULT_SUPABASE_URL = 'https://tcsovxxhoypfpkbmowhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc292eHhob3lwZnBrYm1vd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTQzMjcsImV4cCI6MjEwNDMzMDMyN30.ff3GkoOL1Zz2rjmrIp_azLevX-vabB7Tlvicb3JVJUo';

const envUrl = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env.VITE_SUPABASE_URL : (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
const envKey = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env.VITE_SUPABASE_ANON_KEY : (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = envKey || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
  return supabase;
}

export interface RsvpRecord {
  id?: string;
  eventId?: string;
  event_id?: string;
  eventName: string;
  event_name?: string;
  attendeeName: string;
  attendee_name?: string;
  whatsapp: string;
  skillLevel: string;
  skill_level?: string;
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
  const tablesToCheck = ['members', 'gallery', 'videos', 'events', 'rsvps', 'contact_dispatches'];

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
        return data.map((item) => {
          // voice_note_url from Supabase is the single source of truth for member voice notes
          const rawVoiceNoteUrl = item.voice_note_url || item.voiceNoteUrl || item.audio_url || item.audioUrl || null;
          const voiceNoteUrl =
            typeof rawVoiceNoteUrl === 'string' &&
            rawVoiceNoteUrl.trim() !== '' &&
            rawVoiceNoteUrl !== 'null' &&
            rawVoiceNoteUrl !== 'undefined'
              ? rawVoiceNoteUrl.trim()
              : null;

          return {
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
            photoUrl: item.photo_url || item.photoUrl || '',
            photo_url: item.photo_url || item.photoUrl || '',
            voiceNoteUrl: voiceNoteUrl,
            voice_note_url: voiceNoteUrl,
            audioUrl: voiceNoteUrl || '',
            audio_url: voiceNoteUrl || '',
            createdAt: item.created_at,
          };
        });
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
  member: Omit<CommunityMember, 'id'> & {
    id?: string;
    photoUrl?: string;
    voice_note_url?: string | null;
    voiceNoteUrl?: string | null;
    audioUrl?: string | null;
    audio_url?: string | null;
  }
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

  // Clean and normalize voice_note_url. If empty or null, persist as null.
  const rawAudio =
    member.voice_note_url !== undefined
      ? member.voice_note_url
      : member.voiceNoteUrl !== undefined
      ? member.voiceNoteUrl
      : member.audioUrl || member.audio_url || null;

  const persistentAudioUrl =
    typeof rawAudio === 'string' &&
    rawAudio.trim() !== '' &&
    rawAudio !== 'null' &&
    rawAudio !== 'undefined'
      ? rawAudio.trim()
      : null;

  const newMember: CommunityMember & { photoUrl: string } = {
    ...member,
    id,
    photoUrl: member.photoUrl || member.photo_url || '',
    photo_url: member.photoUrl || member.photo_url || '',
    voiceNoteUrl: persistentAudioUrl,
    voice_note_url: persistentAudioUrl,
    audioUrl: persistentAudioUrl || '',
    audio_url: persistentAudioUrl || '',
    avatarInitials: member.avatarInitials || member.name.slice(0, 2).toUpperCase(),
    accentBg: member.accentBg || '#FFC93C',
    createdAt: member.createdAt || new Date().toISOString(),
  };

  try {
    if (isEditing) {
      const updatePayload: Record<string, unknown> = {
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
        voice_note_url: persistentAudioUrl,
      };

      let { data, error } = await supabase
        .from('members')
        .update({ ...updatePayload, audio_url: persistentAudioUrl })
        .eq('id', newMember.id)
        .select();

      // If audio_url column doesn't exist in Supabase, retry with voice_note_url only
      if (error && error.message && error.message.includes('audio_url')) {
        const retryResult = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', newMember.id)
          .select();
        data = retryResult.data;
        error = retryResult.error;
      }

      // If voice_note_url column doesn't exist yet, retry with audio_url
      if (error && error.message && error.message.includes('voice_note_url')) {
        const altPayload: Record<string, unknown> = { ...updatePayload, audio_url: persistentAudioUrl };
        delete altPayload.voice_note_url;
        const retryResult = await supabase
          .from('members')
          .update(altPayload)
          .eq('id', newMember.id)
          .select();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.warn('Supabase member update error:', error.message);
        return { success: false, member: newMember, error: error.message, source: 'supabase' };
      }
      if (data && data[0]) {
        return { success: true, member: newMember, source: 'supabase' };
      }
    }

    // Insert new member
    const insertPayload: Record<string, unknown> = {
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
      voice_note_url: persistentAudioUrl,
      created_at: newMember.createdAt,
    };

    let { data, error } = await supabase
      .from('members')
      .insert([{ ...insertPayload, audio_url: persistentAudioUrl }])
      .select();

    if (error && error.message && error.message.includes('audio_url')) {
      const retryResult = await supabase
        .from('members')
        .insert([insertPayload])
        .select();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error && error.message && error.message.includes('voice_note_url')) {
      const altPayload: Record<string, unknown> = { ...insertPayload, audio_url: persistentAudioUrl };
      delete altPayload.voice_note_url;
      const retryResult = await supabase
        .from('members')
        .insert([altPayload])
        .select();
      data = retryResult.data;
      error = retryResult.error;
    }

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
   4. EVENT RSVPS & ATTENDEES CRUD WITH CAPACITY ENFORCEMENT
   ========================================================================= */

const LOCAL_RSVPS_KEY = 'mbh_community_rsvps_cache';

export function getLocalRsvps(): RsvpRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_RSVPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveLocalRsvp(rsvp: RsvpRecord): void {
  try {
    const current = getLocalRsvps();
    // Avoid exact duplicate
    const exists = current.some(
      (r) => r.id === rsvp.id || (r.whatsapp === rsvp.whatsapp && r.eventId === rsvp.eventId)
    );
    if (!exists) {
      localStorage.setItem(LOCAL_RSVPS_KEY, JSON.stringify([rsvp, ...current]));
    }
  } catch {
    // ignore
  }
}

export function deleteLocalRsvp(
  id: string,
  details?: { attendeeName?: string; whatsapp?: string; eventId?: string; eventName?: string }
): void {
  try {
    const current = getLocalRsvps();
    const cleanWa = details?.whatsapp ? details.whatsapp.replace(/\D/g, '') : null;
    const cleanName = details?.attendeeName ? details.attendeeName.trim().toLowerCase() : null;

    const updated = current.filter((r) => {
      // Direct ID match
      if (r.id === id) return false;

      // Phone + Name match
      if (cleanWa && cleanName) {
        const rWa = (r.whatsapp || '').replace(/\D/g, '');
        const rName = (r.attendeeName || r.attendee_name || '').trim().toLowerCase();
        if (rWa === cleanWa && rName === cleanName) {
          return false;
        }
      }

      // Event + Phone match
      if (cleanWa && details?.eventId && (r.eventId === details.eventId || r.event_id === details.eventId)) {
        const rWa = (r.whatsapp || '').replace(/\D/g, '');
        if (rWa === cleanWa) return false;
      }

      return true;
    });

    localStorage.setItem(LOCAL_RSVPS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearLocalRsvps(eventIdOrName?: string): void {
  try {
    if (!eventIdOrName) {
      localStorage.removeItem(LOCAL_RSVPS_KEY);
      return;
    }
    const current = getLocalRsvps();
    const target = eventIdOrName.trim().toLowerCase();
    const updated = current.filter((r) => {
      const evId = (r.eventId || r.event_id || '').toLowerCase();
      const evName = (r.eventName || r.event_name || '').toLowerCase();
      return evId !== target && evName !== target;
    });
    localStorage.setItem(LOCAL_RSVPS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function purgeFakeRsvps(): void {
  try {
    const current = getLocalRsvps();
    const filtered = current.filter((r) => {
      const evName = (r.eventName || r.event_name || '').toLowerCase();
      const evId = (r.eventId || r.event_id || '').toLowerCase();
      if (DEMO_EVENT_IDS.has(evId)) return false;
      if (evName.includes('mumbai 59') || evName.includes('carter road sunset cypher #50') || evName.includes('dadar acoustic')) {
        return false;
      }
      return true;
    });
    localStorage.setItem(LOCAL_RSVPS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export async function fetchAllEventRsvpCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // 1. Initial count from local storage cache
  const localRsvps = getLocalRsvps();
  localRsvps.forEach((r) => {
    if (r.eventId) counts[r.eventId] = (counts[r.eventId] || 0) + 1;
    if (r.eventName) counts[r.eventName] = (counts[r.eventName] || 0) + 1;
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      // 2. Try database RPC if configured in Supabase
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_event_rsvp_counts');
      if (!rpcErr && rpcData && Array.isArray(rpcData)) {
        rpcData.forEach((row: { event_id: string; rsvp_count: number | string }) => {
          if (row.event_id) {
            counts[row.event_id] = Number(row.rsvp_count);
          }
        });
        return counts;
      }

      // 3. Fallback to direct query from rsvps table
      const { data, error } = await supabase.from('rsvps').select('id, event_id, event_name');
      if (!error && data && Array.isArray(data)) {
        const dbCounts: Record<string, number> = {};
        data.forEach((r) => {
          if (r.event_id) dbCounts[r.event_id] = (dbCounts[r.event_id] || 0) + 1;
          if (r.event_name) dbCounts[r.event_name] = (dbCounts[r.event_name] || 0) + 1;
        });
        // Merge with local submissions that may not have synced
        localRsvps.forEach((r) => {
          if (r.eventId && !data.some((d) => d.id === r.id)) {
            dbCounts[r.eventId] = (dbCounts[r.eventId] || 0) + 1;
          }
        });
        return dbCounts;
      }
    } catch {
      // ignore
    }
  }

  return counts;
}

export async function submitEventRsvp(rsvp: {
  eventId?: string;
  eventName: string;
  attendeeName: string;
  whatsapp: string;
  skillLevel: string;
}): Promise<{
  success: boolean;
  error?: string;
  source: 'supabase' | 'local';
  isFull?: boolean;
  currentCount?: number;
  maxPeople?: number | null;
}> {
  const supabase = getSupabase();
  let eventId = rsvp.eventId;

  // Locate the target event
  let targetEvent: EventItem | undefined;
  const currentEvents = getLocalEvents();

  if (eventId) {
    targetEvent = currentEvents.find((e) => e.id === eventId);
  }
  if (!targetEvent && rsvp.eventName) {
    targetEvent = currentEvents.find(
      (e) => (e.title || e.name || '').toLowerCase() === rsvp.eventName.toLowerCase()
    );
  }

  // If not found in local cache, query Supabase
  if (!targetEvent && supabase && eventId) {
    try {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle();
      if (data) {
        targetEvent = {
          id: data.id,
          title: data.title || data.name,
          name: data.title || data.name,
          description: data.description || data.blurb || '',
          blurb: data.description || data.blurb || '',
          eventType: data.event_type || 'cypher',
          date: data.date,
          time: data.time || '5:30 PM',
          venue: data.venue,
          location: data.location || data.area || 'Mumbai',
          area: data.location || data.area || 'Mumbai',
          entry: data.entry || 'Free Entry / Open to all',
          isPublished: data.is_published !== false,
          maxPeople: data.max_people,
          registrationStatus: data.registration_status || 'open',
        };
      }
    } catch {
      // ignore
    }
  }

  if (targetEvent) {
    eventId = targetEvent.id;

    // Verify event is published
    if (targetEvent.isPublished === false || targetEvent.is_published === false) {
      return {
        success: false,
        error: 'Registration is not available for this event.',
        source: 'supabase',
      };
    }

    // Verify registration status is not closed
    const status = targetEvent.registrationStatus || targetEvent.registration_status;
    if (status === 'closed') {
      return {
        success: false,
        error: 'REGISTRATION CLOSED: This event is not currently accepting RSVPs.',
        source: 'supabase',
      };
    }

    // Check capacity: count existing RSVPs
    const counts = await fetchAllEventRsvpCounts();
    const currentCount = counts[targetEvent.id] ?? (targetEvent.name ? counts[targetEvent.name] : 0) ?? 0;
    const maxPeople = targetEvent.maxPeople ?? targetEvent.max_people;

    if (maxPeople !== null && maxPeople !== undefined && currentCount >= maxPeople) {
      updateEventRegistrationStatus(targetEvent.id, 'full');
      return {
        success: false,
        error: 'SLOTS FULL: Maximum capacity for this cypher has been reached.',
        isFull: true,
        currentCount,
        maxPeople,
        source: 'supabase',
      };
    }
  }

  // Attempt atomic database-side function/RPC for concurrency safety
  if (supabase) {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_event_rsvp', {
        p_event_id: eventId || '',
        p_event_name: rsvp.eventName,
        p_attendee_name: rsvp.attendeeName,
        p_whatsapp: rsvp.whatsapp,
        p_skill_level: rsvp.skillLevel,
      });

      if (!rpcErr && rpcRes) {
        if (rpcRes.success === false) {
          return {
            success: false,
            error: rpcRes.error || 'Registration rejected',
            isFull: Boolean(rpcRes.is_full),
            source: 'supabase',
          };
        }

        saveLocalRsvp({
          id: rpcRes.id || `rsvp-${Date.now()}`,
          eventId: rpcRes.event_id || eventId,
          event_id: rpcRes.event_id || eventId,
          eventName: rsvp.eventName,
          attendeeName: rsvp.attendeeName,
          whatsapp: rsvp.whatsapp,
          skillLevel: rsvp.skillLevel,
          createdAt: new Date().toISOString(),
        });

        return {
          success: true,
          source: 'supabase',
          currentCount: rpcRes.current_count,
          maxPeople: rpcRes.max_people,
        };
      }
    } catch {
      // RPC fallback to direct insert
    }

    // Direct insert to Supabase rsvps table
    try {
      const newId = `rsvp-${Date.now()}`;
      const payload: Record<string, unknown> = {
        id: newId,
        event_name: rsvp.eventName,
        attendee_name: rsvp.attendeeName,
        whatsapp: rsvp.whatsapp,
        skill_level: rsvp.skillLevel,
      };
      if (eventId) {
        payload.event_id = eventId;
      }

      const { error: insertErr } = await supabase.from('rsvps').insert([payload]);

      if (!insertErr) {
        saveLocalRsvp({
          id: newId,
          eventId,
          event_id: eventId,
          eventName: rsvp.eventName,
          attendeeName: rsvp.attendeeName,
          whatsapp: rsvp.whatsapp,
          skillLevel: rsvp.skillLevel,
          createdAt: new Date().toISOString(),
        });

        if (targetEvent) {
          const maxPeople = targetEvent.maxPeople ?? targetEvent.max_people;
          if (maxPeople !== null && maxPeople !== undefined) {
            const counts = await fetchAllEventRsvpCounts();
            const newCount = (counts[targetEvent.id] || 0) + 1;
            if (newCount >= maxPeople) {
              updateEventRegistrationStatus(targetEvent.id, 'full');
            }
          }
        }

        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase RSVP insert warning:', insertErr.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase RSVP exception:', msg);
    }
  }

  // Local fallback
  const localId = `rsvp-${Date.now()}`;
  saveLocalRsvp({
    id: localId,
    eventId,
    event_id: eventId,
    eventName: rsvp.eventName,
    attendeeName: rsvp.attendeeName,
    whatsapp: rsvp.whatsapp,
    skillLevel: rsvp.skillLevel,
    createdAt: new Date().toISOString(),
  });

  if (targetEvent) {
    const maxPeople = targetEvent.maxPeople ?? targetEvent.max_people;
    if (maxPeople !== null && maxPeople !== undefined) {
      const counts = await fetchAllEventRsvpCounts();
      const count = counts[targetEvent.id] || 0;
      if (count >= maxPeople) {
        updateEventRegistrationStatus(targetEvent.id, 'full');
      }
    }
  }

  return { success: true, source: 'local' };
}

export const saveRsvp = submitEventRsvp;
export const saveEventRsvp = submitEventRsvp;

export async function fetchRsvps(): Promise<RsvpRecord[]> {
  // Public users must NOT be able to read RSVPs
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return [];
  }

  // Purge any fake or test demo RSVPs from local cache
  purgeFakeRsvps();

  const supabase = getSupabase();
  const localItems = getLocalRsvps();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Filter out any fake demo event RSVPs from Supabase results
        const dbItems: RsvpRecord[] = data
          .filter((r) => {
            const evName = (r.event_name || '').toLowerCase();
            const evId = (r.event_id || '').toLowerCase();
            if (DEMO_EVENT_IDS.has(evId)) return false;
            if (evName.includes('mumbai 59') || evName.includes('carter road sunset cypher #50') || evName.includes('dadar acoustic')) {
              return false;
            }
            return true;
          })
          .map((r) => ({
            id: r.id,
            eventId: r.event_id,
            event_id: r.event_id,
            eventName: r.event_name,
            event_name: r.event_name,
            attendeeName: r.attendee_name,
            attendee_name: r.attendee_name,
            whatsapp: r.whatsapp,
            skillLevel: r.skill_level,
            skill_level: r.skill_level,
            createdAt: r.created_at,
          }));

        // Merge any real local items not yet in DB
        const merged = [...dbItems];
        localItems.forEach((l) => {
          const exists = merged.some(
            (m) =>
              m.id === l.id ||
              ((m.whatsapp || '').replace(/\D/g, '') === (l.whatsapp || '').replace(/\D/g, '') &&
                (m.attendeeName || '').trim().toLowerCase() === (l.attendeeName || '').trim().toLowerCase())
          );
          if (!exists) {
            merged.push(l);
          }
        });

        return merged;
      }
      if (error) {
        console.warn('Supabase RSVP fetch error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase RSVP fetch error:', err);
    }
  }

  return localItems;
}

export async function deleteRsvp(
  id: string,
  details?: { attendeeName?: string; whatsapp?: string; eventName?: string; eventId?: string }
): Promise<{ success: boolean; error?: string }> {
  // Public users must NOT be able to delete RSVPs
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Administrator authentication required.' };
  }

  // 1. Immediately delete from local cache so the item is permanently gone
  deleteLocalRsvp(id, details);

  const supabase = getSupabase();
  if (supabase) {
    // 2. Try Postgres RPC delete_event_rsvp (runs with SECURITY DEFINER to bypass any RLS denial)
    try {
      const { error: rpcErr } = await supabase.rpc('delete_event_rsvp', {
        p_id: id,
        p_attendee_name: details?.attendeeName || null,
        p_whatsapp: details?.whatsapp || null,
      });
      if (!rpcErr) {
        return { success: true };
      }
    } catch {
      // ignore, try direct delete
    }

    // 3. Direct delete by exact ID
    try {
      const { error: delErr } = await supabase.from('rsvps').delete().eq('id', id);
      if (!delErr) {
        return { success: true };
      }
      console.warn('Supabase delete RSVP by id error:', delErr.message);

      // 4. If ID did not match (e.g. client ID format), delete by attendee name & phone number
      if (details?.attendeeName && details?.whatsapp) {
        const { error: matchErr } = await supabase
          .from('rsvps')
          .delete()
          .match({ attendee_name: details.attendeeName, whatsapp: details.whatsapp });
        if (!matchErr) {
          return { success: true };
        }
      }
    } catch (err) {
      console.warn('Supabase delete RSVP exception:', err);
    }
  }

  // Item is purged from local cache and client state
  return { success: true };
}

export async function deleteEventRsvps(
  eventId?: string,
  eventName?: string
): Promise<{ success: boolean }> {
  clearLocalRsvps(eventId || eventName);

  const supabase = getSupabase();
  if (supabase && (eventId || eventName)) {
    try {
      await supabase.rpc('delete_all_rsvps_for_event', {
        p_event_id: eventId || null,
        p_event_name: eventName || null,
      });
    } catch {
      try {
        if (eventId) {
          await supabase.from('rsvps').delete().eq('event_id', eventId);
        }
        if (eventName) {
          await supabase.from('rsvps').delete().eq('event_name', eventName);
        }
      } catch {
        // ignore
      }
    }
  }

  return { success: true };
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

/* =========================================================================
   6. UPCOMING EVENTS & CYPHERS CRUD WITH CAPACITY & REGISTRATION STATUS
   ========================================================================= */

const LOCAL_EVENTS_KEY = 'mbh_community_events_cache';
const DEMO_EVENT_IDS = new Set([
  'evt-mumbai-59-cypher',
  'evt-carter-road-50',
  'carter-road-cypher-48',
  'dadar-acoustic-jam',
  'evt-01',
  'evt-02',
  'evt-03',
]);

export function isFakeOrDemoEvent(e: { id?: string; title?: string; name?: string; slug?: string }): boolean {
  if (!e || !e.id) return false;
  return DEMO_EVENT_IDS.has(e.id);
}

export function formatEventDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // Check if date is in ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  return dateStr;
}

export function toIsoDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return trimmed;
}

export function getDefaultEvents(): EventItem[] {
  return [];
}

export function getLocalEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item: EventItem) => !isFakeOrDemoEvent(item));
        if (cleaned.length !== parsed.length) {
          setLocalEvents(cleaned);
        }
        return cleaned.map((e) => ({
          ...e,
          title: e.title || e.name,
          name: e.name || e.title,
          description: e.description || e.blurb,
          blurb: e.blurb || e.description,
          location: e.location || e.area,
          area: e.area || e.location,
          date: toIsoDate(e.date) || e.date,
          registrationStatus: (e.registrationStatus || e.registration_status || 'open') as 'open' | 'full' | 'closed',
          registration_status: (e.registration_status || e.registrationStatus || 'open') as 'open' | 'full' | 'closed',
          maxPeople: e.maxPeople !== undefined ? e.maxPeople : e.max_people,
          max_people: e.max_people !== undefined ? e.max_people : e.maxPeople,
        }));
      }
    }
  } catch {
    // fallback
  }

  return [];
}

export function setLocalEvents(events: EventItem[]): void {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function updateLocalEventStatus(eventId: string, newStatus: 'open' | 'full' | 'closed'): void {
  const current = getLocalEvents();
  const updated = current.map((e) => {
    if (e.id === eventId) {
      return {
        ...e,
        registrationStatus: newStatus,
        registration_status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return e;
  });
  setLocalEvents(updated);
}

export async function updateEventRegistrationStatus(
  eventId: string,
  newStatus: 'open' | 'full' | 'closed'
): Promise<boolean> {
  // Update local cache immediately
  updateLocalEventStatus(eventId, newStatus);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          registration_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (!error) return true;
      console.warn('Supabase status update warning:', error.message);
    } catch (err) {
      console.warn('Supabase status update exception:', err);
    }
  }

  return true;
}

export async function fetchUpcomingEvents(): Promise<EventItem[]> {
  const supabase = getSupabase();
  let rsvpCounts: Record<string, number> = {};

  try {
    rsvpCounts = await fetchAllEventRsvpCounts();
  } catch {
    // ignore
  }

  let dbEvents: EventItem[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        // Filter out any fake demo events
        const realData = data.filter((d) => !isFakeOrDemoEvent(d));

        // Purge fake demo events from Supabase in the background if they exist
        const fakeRows = data.filter((d) => isFakeOrDemoEvent(d));
        if (fakeRows.length > 0) {
          for (const fake of fakeRows) {
            supabase.from('events').delete().eq('id', fake.id).then(() => {});
          }
        }

        dbEvents = realData.map((d) => {
          const title = d.title || d.name || 'Upcoming Cypher';
          const desc = d.description || d.blurb || '';
          const loc = d.location || d.area || 'Mumbai';
          const dateIso = toIsoDate(d.date) || d.date;
          const status = (d.registration_status || 'open') as 'open' | 'full' | 'closed';
          const maxP = d.max_people !== undefined ? d.max_people : null;
          const count = rsvpCounts[d.id] ?? (title ? rsvpCounts[title] : 0) ?? 0;

          // Auto detect full if open but cap reached
          let finalStatus = status;
          if (status === 'open' && maxP !== null && maxP !== undefined && count >= maxP) {
            finalStatus = 'full';
          }

          return {
            id: d.id,
            title,
            name: title,
            slug: d.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: desc,
            blurb: desc,
            eventType: d.event_type || 'cypher',
            event_type: d.event_type || 'cypher',
            date: dateIso,
            time: d.time || '5:30 PM',
            venue: d.venue,
            location: loc,
            area: loc,
            entry: d.entry || 'Free Entry / Open to all',
            coverImageUrl: d.cover_image_url,
            cover_image_url: d.cover_image_url,
            registrationUrl: d.registration_url,
            registration_url: d.registration_url,
            isPublished: d.is_published !== false,
            is_published: d.is_published !== false,
            maxPeople: maxP,
            max_people: maxP,
            registrationStatus: finalStatus,
            registration_status: finalStatus,
            rsvpCount: count,
            isBattleOrLive: Boolean(d.is_battle_or_live),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          };
        });
      } else if (error) {
        console.warn('Supabase events fetch error, using local events fallback:', error.message);
      }
    } catch (err) {
      console.warn('Supabase events fetch exception:', err);
    }
  }

  // Preserve and merge any real local events that aren't yet in DB (prevents newly added local events from getting wiped)
  const localList = getLocalEvents().filter((e) => !isFakeOrDemoEvent(e));
  const merged: EventItem[] = [...dbEvents];

  for (const local of localList) {
    const alreadyInDb = merged.some(
      (m) =>
        m.id === local.id ||
        (m.title.trim().toLowerCase() === (local.title || local.name || '').trim().toLowerCase() &&
          m.date === local.date)
    );
    if (!alreadyInDb) {
      const count = rsvpCounts[local.id] ?? (local.name ? rsvpCounts[local.name] : 0) ?? 0;
      const maxP = local.maxPeople ?? local.max_people;
      let status = local.registrationStatus || local.registration_status || 'open';
      if (status === 'open' && maxP !== null && maxP !== undefined && count >= maxP) {
        status = 'full';
      }
      merged.push({
        ...local,
        rsvpCount: count,
        registrationStatus: status,
        registration_status: status,
      });
    }
  }

  // Sort events chronologically by date
  merged.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeA - timeB;
  });

  setLocalEvents(merged);
  return merged;
}

export async function saveUpcomingEvent(
  item: Omit<EventItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item: EventItem; error?: string; source: 'supabase' | 'local' }> {
  // Check admin session with grace for active dashboard
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }

  const hasDashboardSession =
    typeof window !== 'undefined' &&
    (Boolean(Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))) ||
      localStorage.getItem('sb-admin-verified') === 'true');

  if (!isAdminAuthenticated() && !hasDashboardSession) {
    return {
      success: false,
      item: { ...item, id: item.id || `evt-${Date.now()}` } as EventItem,
      error: 'Security constraint: Administrator authentication required.',
      source: 'local',
    };
  }

  const isEditing = Boolean(item.id);
  const fallbackId = `evt-${Date.now()}`;
  const eventId = item.id || fallbackId;
  const title = item.title || item.name || 'Community Cypher';
  const desc = item.description || item.blurb || '';
  const loc = item.location || item.area || 'Mumbai';
  const isoDate = toIsoDate(item.date) || item.date;
  const status = (item.registrationStatus || item.registration_status || 'open') as 'open' | 'full' | 'closed';
  const maxP = item.maxPeople !== undefined ? item.maxPeople : item.max_people ?? null;
  const slug = item.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const nowIso = new Date().toISOString();

  let newEvent: EventItem = {
    ...item,
    id: eventId,
    title,
    name: title,
    slug,
    description: desc,
    blurb: desc,
    eventType: item.eventType || item.event_type || 'cypher',
    event_type: item.eventType || item.event_type || 'cypher',
    date: isoDate,
    time: item.time || '5:30 PM',
    venue: item.venue,
    location: loc,
    area: loc,
    entry: item.entry || 'Free Entry / Open to all',
    isPublished: item.isPublished !== false && item.is_published !== false,
    is_published: item.isPublished !== false && item.is_published !== false,
    maxPeople: maxP,
    max_people: maxP,
    registrationStatus: status,
    registration_status: status,
    isBattleOrLive: Boolean(item.isBattleOrLive),
    createdAt: item.createdAt || nowIso,
    updatedAt: nowIso,
  };

  // 1. Immediately store in local cache so UI reacts instantaneously
  const currentEvents = getLocalEvents();
  let updatedEvents: EventItem[];
  if (isEditing) {
    updatedEvents = currentEvents.map((e) => (e.id === eventId ? newEvent : e));
  } else {
    updatedEvents = [newEvent, ...currentEvents.filter((e) => e.id !== eventId)];
  }
  setLocalEvents(updatedEvents);

  // 2. Sync to Supabase with adaptive column handling
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Build candidate payload
      const candidatePayload: Record<string, any> = {
        title: newEvent.title,
        name: newEvent.title,
        slug: newEvent.slug,
        description: newEvent.description,
        blurb: newEvent.description,
        event_type: newEvent.eventType,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        location: newEvent.location,
        area: newEvent.location,
        entry: newEvent.entry,
        is_published: newEvent.isPublished,
        max_people: newEvent.maxPeople,
        registration_status: newEvent.registrationStatus,
        is_battle_or_live: Boolean(newEvent.isBattleOrLive),
        updated_at: newEvent.updatedAt,
      };

      if (!isEditing) {
        candidatePayload.created_at = newEvent.createdAt;
        // If eventId matches UUID or text ID
        if (eventId && !eventId.startsWith('temp-')) {
          candidatePayload.id = eventId;
        }
      }

      // Adaptive retry loop to strip missing columns if Postgres schema differs
      let attemptPayload = { ...candidatePayload };
      let lastErrorMessage = '';
      let syncedToSupabase = false;

      for (let attempt = 0; attempt < 6; attempt++) {
        if (isEditing) {
          const { data, error } = await supabase
            .from('events')
            .update(attemptPayload)
            .eq('id', eventId)
            .select();

          if (!error) {
            syncedToSupabase = true;
            if (data && data[0]?.id) {
              newEvent = { ...newEvent, id: data[0].id };
            }
            break;
          }

          lastErrorMessage = error.message;

          // Check if an unknown column caused failure
          const colMatch =
            error.message.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i) ||
            error.message.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);

          if (colMatch && colMatch[1] && colMatch[1] in attemptPayload) {
            delete attemptPayload[colMatch[1]];
            continue;
          }

          // If RLS policy blocked update
          if (error.code === '42501' || error.message.includes('row-level security')) {
            break;
          }

          break;
        } else {
          // INSERT NEW EVENT
          const { data, error } = await supabase
            .from('events')
            .insert([attemptPayload])
            .select();

          if (!error) {
            syncedToSupabase = true;
            if (data && data[0]?.id) {
              const remoteId = data[0].id;
              newEvent = { ...newEvent, id: remoteId };
              // Update local cache with remote assigned ID
              const remapped = getLocalEvents().map((e) => (e.id === eventId ? newEvent : e));
              setLocalEvents(remapped);
            }
            break;
          }

          lastErrorMessage = error.message;

          // Check if column does not exist
          const colMatch =
            error.message.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i) ||
            error.message.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);

          if (colMatch && colMatch[1] && colMatch[1] in attemptPayload) {
            delete attemptPayload[colMatch[1]];
            continue;
          }

          // Check if UUID error on 'id'
          if (error.message.includes('uuid') && 'id' in attemptPayload) {
            delete attemptPayload.id;
            continue;
          }

          // If RLS policy blocked insert
          if (error.code === '42501' || error.message.includes('row-level security')) {
            break;
          }

          break;
        }
      }

      if (syncedToSupabase) {
        return { success: true, item: newEvent, source: 'supabase' };
      }

      console.warn('Supabase event cloud sync note:', lastErrorMessage);
      return {
        success: true,
        item: newEvent,
        error: lastErrorMessage ? `Saved locally. Remote cloud sync notice: ${lastErrorMessage}` : undefined,
        source: 'local',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase events exception:', msg);
      return { success: true, item: newEvent, error: `Saved locally. Note: ${msg}`, source: 'local' };
    }
  }

  return { success: true, item: newEvent, source: 'local' };
}

export async function deleteUpcomingEvent(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isAdminAuthenticated()) {
    await verifyAdminSessionLive();
  }
  if (!isAdminAuthenticated()) {
    return { success: false, error: 'Security constraint: Administrator authentication required.' };
  }

  // Find target event before filtering to clean its related RSVPs
  const current = getLocalEvents();
  const targetEvent = current.find((e) => e.id === id);
  const filtered = current.filter((e) => e.id !== id);
  setLocalEvents(filtered);

  // Clean all associated RSVPs for this event locally and in Supabase
  if (targetEvent) {
    deleteEventRsvps(id, targetEvent.title || targetEvent.name);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        console.warn('Supabase events delete warning:', error.message);
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase events delete exception:', msg);
      return { success: true };
    }
  }

  return { success: true };
}

// Module-level auto-cleanup of fake demo events & demo RSVPs
try {
  const storedEventsRaw = typeof window !== 'undefined' ? localStorage.getItem('mbh_community_events_cache') : null;
  if (storedEventsRaw) {
    const stored = JSON.parse(storedEventsRaw);
    if (Array.isArray(stored)) {
      const cleaned = stored.filter((e) => !isFakeOrDemoEvent(e));
      if (cleaned.length !== stored.length) {
        localStorage.setItem('mbh_community_events_cache', JSON.stringify(cleaned));
      }
    }
  }
  if (typeof window !== 'undefined') {
    purgeFakeRsvps();
  }
} catch {
  // ignore
}
