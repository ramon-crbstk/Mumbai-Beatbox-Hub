export type RegistrationStatus = 'open' | 'full' | 'closed';

export interface EventItem {
  id: string;
  title: string;
  name: string; // alias for title for backward compatibility
  slug?: string;
  description: string;
  blurb: string; // alias for description
  eventType: string; // 'cypher' | 'battle' | etc.
  event_type?: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string;
  venue: string;
  location: string;
  area: string; // alias for location
  entry: string;
  coverImageUrl?: string;
  cover_image_url?: string;
  registrationUrl?: string;
  registration_url?: string;
  isPublished?: boolean;
  is_published?: boolean;
  maxPeople?: number | null;
  max_people?: number | null;
  registrationStatus: RegistrationStatus;
  registration_status?: RegistrationStatus;
  rsvpCount?: number;
  isBattleOrLive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface PillarCard {
  id: string;
  number: string;
  title: string;
  blurb: string;
  highlight: string;
  iconName: 'Users' | 'Mic' | 'Trophy';
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  location: string;
  dateStr: string;
  aspect: 'square' | 'tall' | 'wide';
  photoUrl?: string;
  createdAt?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  performer: string;
  venue: string;
  duration: string;
  category: string;
  viewsEstimate: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

export interface PartnerLogo {
  id: string;
  name: string;
  role: string;
}

export interface RsvpState {
  isOpen: boolean;
  selectedEventId?: string;
  selectedEventName?: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  area: string;
  experience: string;
  voiceNoteTitle: string;
  voiceNoteDuration: string;
  soundType: 'bass-growl' | 'liproll' | 'fast-tech' | 'trap-click' | 'polyphonic' | 'scratch';
  avatarInitials: string;
  accentBg: string;
  photoUrl?: string;
  photo_url: string | null;
  voiceNoteUrl?: string | null;
  voice_note_url: string | null;
  audioUrl?: string | null;
  audio_url?: string | null;
  createdAt?: string;
}

