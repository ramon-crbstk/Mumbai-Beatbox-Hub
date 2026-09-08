export interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  area: string;
  blurb: string;
  entry: string;
  isBattleOrLive?: boolean;
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

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
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
  createdAt?: string;
}

