import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as sharedSupabaseClient } from './supabase.js';
import { CommunityMember, GalleryItem, VideoItem } from '../types';
import { COMMUNITY_MEMBERS, GALLERY_ITEMS, FEATURED_VIDEOS } from '../data/communityData';

// Retrieve environment variables safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tcsovxxhoypfpkbmowhd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

const LOCAL_STORAGE_GALLERY_KEY = 'mhb_gallery_media';

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
    } catch (err) {
      console.warn('Supabase fetch gallery error, using local/static fallback:', err);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return GALLERY_ITEMS;
}

export async function saveGalleryItem(
  item: Omit<GalleryItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item: GalleryItem; error?: string; source: 'supabase' | 'local' }> {
  const supabase = getSupabase();
  const id = item.id || `gal-${Date.now()}`;
  const newItem: GalleryItem = {
    ...item,
    id,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('gallery').upsert([
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

      if (!error && data && data[0]) {
        updateLocalGalleryCache(newItem);
        return { success: true, item: newItem, source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase gallery save error:', error.message);
        updateLocalGalleryCache(newItem);
        return { success: true, item: newItem, error: error.message, source: 'local' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase gallery save error, saving locally:', msg);
      updateLocalGalleryCache(newItem);
      return { success: true, item: newItem, error: msg, source: 'local' };
    }
  }

  // Fallback local persistence
  updateLocalGalleryCache(newItem);
  return { success: true, item: newItem, source: 'local' };
}

function updateLocalGalleryCache(item: GalleryItem) {
  try {
    const current = getLocalGalleryItems();
    const index = current.findIndex((g) => g.id === item.id);
    if (index >= 0) {
      current[index] = item;
    } else {
      current.unshift(item);
    }
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function getLocalGalleryItems(): GalleryItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [...GALLERY_ITEMS];
}

export async function deleteGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) {
        console.warn('Supabase gallery delete error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase gallery delete error:', err);
    }
  }

  try {
    const current = getLocalGalleryItems().filter((g) => g.id !== id);
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }

  return { success: true };
}

/* =========================================================================
   2. FEATURED VIDEOS & ROUTINE DROPS CRUD
   ========================================================================= */

const LOCAL_STORAGE_VIDEOS_KEY = 'mhb_featured_videos';

export async function fetchVideos(): Promise<VideoItem[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
    } catch (err) {
      console.warn('Supabase fetch videos error, using fallback:', err);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return FEATURED_VIDEOS;
}

export async function saveVideoItem(
  item: Omit<VideoItem, 'id'> & { id?: string }
): Promise<{ success: boolean; item: VideoItem; error?: string; source: 'supabase' | 'local' }> {
  const supabase = getSupabase();
  const id = item.id || `vid-${Date.now()}`;
  const newItem: VideoItem = {
    ...item,
    id,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('videos').upsert([
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

      if (!error && data && data[0]) {
        updateLocalVideosCache(newItem);
        return { success: true, item: newItem, source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase video save error:', error.message);
        updateLocalVideosCache(newItem);
        return { success: true, item: newItem, error: error.message, source: 'local' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase video save error, saving locally:', msg);
      updateLocalVideosCache(newItem);
      return { success: true, item: newItem, error: msg, source: 'local' };
    }
  }

  updateLocalVideosCache(newItem);
  return { success: true, item: newItem, source: 'local' };
}

function updateLocalVideosCache(item: VideoItem) {
  try {
    const current = getLocalVideos();
    const index = current.findIndex((v) => v.id === item.id);
    if (index >= 0) {
      current[index] = item;
    } else {
      current.unshift(item);
    }
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function getLocalVideos(): VideoItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [...FEATURED_VIDEOS];
}

export async function deleteVideoItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) {
        console.warn('Supabase video delete error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase video delete error:', err);
    }
  }

  try {
    const current = getLocalVideos().filter((v) => v.id !== id);
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }

  return { success: true };
}

/* =========================================================================
   3. COMMUNITY MEMBERS & VOICE NOTES CRUD
   ========================================================================= */

const LOCAL_STORAGE_MEMBERS_KEY = 'mhb_community_members';

export async function fetchCommunityMembers(): Promise<(CommunityMember & { photoUrl: string })[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
          photoUrl: item.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Error fetching Supabase members, using local/static fallback:', err);
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return COMMUNITY_MEMBERS;
}

export async function saveCommunityMember(
  member: Omit<CommunityMember, 'id'> & { id?: string; photoUrl?: string }
): Promise<{ success: boolean; member: CommunityMember & { photoUrl: string }; error?: string; source: 'supabase' | 'local' }> {
  const supabase = getSupabase();
  const id = member.id || `mhb-${Date.now()}`;
  const newMember: CommunityMember & { photoUrl: string } = {
    ...member,
    id,
    photoUrl: member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    avatarInitials: member.avatarInitials || member.name.slice(0, 2).toUpperCase(),
    accentBg: member.accentBg || '#FFC93C',
    createdAt: member.createdAt || new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('members').upsert([
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

      if (!error && data && data[0]) {
        updateLocalMemberCache(newMember);
        return { success: true, member: newMember, source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase member save error:', error.message);
        updateLocalMemberCache(newMember);
        return { success: true, member: newMember, error: error.message, source: 'local' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase member save error, saving locally:', msg);
      updateLocalMemberCache(newMember);
      return { success: true, member: newMember, error: msg, source: 'local' };
    }
  }

  updateLocalMemberCache(newMember);
  return { success: true, member: newMember, source: 'local' };
}

function updateLocalMemberCache(member: CommunityMember & { photoUrl: string }) {
  try {
    const current = getLocalMembers();
    const index = current.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      current[index] = member;
    } else {
      current.unshift(member);
    }
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function getLocalMembers(): (CommunityMember & { photoUrl: string })[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [...COMMUNITY_MEMBERS];
}

export async function deleteCommunityMember(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        console.warn('Supabase member delete error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase member delete error:', err);
    }
  }

  try {
    const current = getLocalMembers().filter((m) => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }

  return { success: true };
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
          created_at: new Date().toISOString(),
        },
      ]);

      if (!error) {
        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase RSVP insert error, falling back to local storage:', error.message);
      saveLocalRsvp(rsvp);
      return { success: true, error: error.message, source: 'local' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase RSVP error:', msg);
      saveLocalRsvp(rsvp);
      return { success: true, error: msg, source: 'local' };
    }
  }

  saveLocalRsvp(rsvp);
  return { success: true, source: 'local' };
}

export const saveEventRsvp = saveRsvp;

function saveLocalRsvp(rsvp: {
  eventName: string;
  attendeeName: string;
  whatsapp: string;
  skillLevel: string;
}) {
  try {
    const existing = JSON.parse(localStorage.getItem('mhb_rsvps') || '[]');
    existing.unshift({ ...rsvp, createdAt: new Date().toISOString(), id: `rsvp-${Date.now()}` });
    localStorage.setItem('mhb_rsvps', JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export async function fetchRsvps(): Promise<RsvpRecord[]> {
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
    } catch (err) {
      console.warn('Supabase RSVP fetch error:', err);
    }
  }

  try {
    return JSON.parse(localStorage.getItem('mhb_rsvps') || '[]');
  } catch {
    return [];
  }
}

export async function deleteRsvp(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('rsvps').delete().eq('id', id);
    } catch {
      // ignore
    }
  }
  try {
    const existing = JSON.parse(localStorage.getItem('mhb_rsvps') || '[]');
    const filtered = existing.filter((r: { id?: string }) => r.id !== id);
    localStorage.setItem('mhb_rsvps', JSON.stringify(filtered));
  } catch {
    // ignore
  }
  return true;
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
          created_at: new Date().toISOString(),
        },
      ]);

      if (!error) {
        return { success: true, source: 'supabase' };
      }
      console.warn('Supabase Dispatch insert error, falling back to local storage:', error.message);
      saveLocalDispatch(dispatch);
      return { success: true, error: error.message, source: 'local' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Supabase Dispatch error:', msg);
      saveLocalDispatch(dispatch);
      return { success: true, error: msg, source: 'local' };
    }
  }

  saveLocalDispatch(dispatch);
  return { success: true, source: 'local' };
}

function saveLocalDispatch(dispatch: {
  name: string;
  contact: string;
  experience: string;
  area: string;
  message: string;
}) {
  try {
    const existing = JSON.parse(localStorage.getItem('mhb_dispatches') || '[]');
    existing.unshift({ ...dispatch, createdAt: new Date().toISOString(), id: `disp-${Date.now()}` });
    localStorage.setItem('mhb_dispatches', JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export async function fetchContactDispatches(): Promise<ContactDispatchRecord[]> {
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
    } catch (err) {
      console.warn('Supabase dispatch fetch error:', err);
    }
  }

  try {
    return JSON.parse(localStorage.getItem('mhb_dispatches') || '[]');
  } catch {
    return [];
  }
}

export async function deleteContactDispatch(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('contact_dispatches').delete().eq('id', id);
    } catch {
      // ignore
    }
  }
  try {
    const existing = JSON.parse(localStorage.getItem('mhb_dispatches') || '[]');
    const filtered = existing.filter((d: { id?: string }) => d.id !== id);
    localStorage.setItem('mhb_dispatches', JSON.stringify(filtered));
  } catch {
    // ignore
  }
  return true;
}
