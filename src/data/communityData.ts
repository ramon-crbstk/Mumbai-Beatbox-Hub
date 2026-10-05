import { EventItem, PillarCard, GalleryItem, VideoItem, PartnerLogo, CommunityMember } from '../types';

export const COMMUNITY_STATS = [
  {
    number: '10+',
    label: 'Active Beatboxers',
    subtext: 'From newcomers to OGs',
  },
  {
    number: 'Weekly',
    label: 'Cyphers & Meetups',
    subtext: 'Coastlines, parks & college plazas',
  },
  {
    number: '0',
    label: 'Instruments Used',
    subtext: '100% human vocal cords & diaphragm',
  },
  {
    number: 'Mumbai',
    label: 'Home Base',
    subtext: 'Western, Central & Harbour lines',
  },
];

export const PILLARS: PillarCard[] = [
  {
    id: 'cyphers',
    number: '01',
    title: 'Cyphers & Jams',
    blurb:
      'Casual weekend circles popping up across the city—from sea-breeze sessions at Carter Road to sunset steps at Bandstand. Pass the mic, exchange counter-rhythms, and lock into spontaneous tempo switches.',
    highlight: 'Weekend Circles · All Skill Levels',
    iconName: 'Users',
  },
  {
    id: 'workshops',
    number: '02',
    title: 'Workshops & Mentorship',
    blurb:
      'From foundational kick-drum physics and tongue-click precision to inward bass control, polyphonic throat singing, and building coherent 90-second tournament routines.',
    highlight: 'Technique Drills · Sound Design',
    iconName: 'Mic',
  },
  {
    id: 'battles',
    number: '03',
    title: 'Battles & Showcases',
    blurb:
      'Raw underground 7-to-smoke face-offs, crew battles, filmed YouTube cyphers, and stage slots at collegiate cultural festivals across Mumbai.',
    highlight: '7-to-Smoke · Live Showcases',
    iconName: 'Trophy',
  },
];

export const UPCOMING_EVENTS: EventItem[] = [];

// No fake gallery images: populated dynamically from authentic Supabase uploads
export const GALLERY_ITEMS: GalleryItem[] = [];

export const FEATURED_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1789551569120',
    title: 'Dilip vs Napom',
    performer: 'Dilip // Napom',
    venue: 'GBB23 , JAPAN',
    duration: '03:45',
    category: 'WORLD LEAGUE',
    viewsEstimate: 'Community Drop',
    videoUrl: 'https://youtu.be/xMPepVSLUWw',
    thumbnailUrl: 'https://res.cloudinary.com/dam67zwcg/image/upload/v1789551566/mumbai-beatbox-hub/videos/thumbnails/fbs1dhwpakjet51snidx.png',
    createdAt: '2026-09-16T09:39:29.12+00:00',
  },
  {
    id: 'vid-1789034128014',
    title: 'Wildcard gbb 2025',
    performer: 'Wing',
    venue: 'Korea',
    duration: '1:30 sec',
    category: 'Solo',
    viewsEstimate: 'Community Drop',
    videoUrl: 'https://youtu.be/-D_bGvUcJdc',
    thumbnailUrl: 'https://res.cloudinary.com/dam67zwcg/image/upload/v1789552578/mumbai-beatbox-hub/videos/thumbnails/lqbso4iwqr39kkcnpzcj.png',
    createdAt: '2026-09-10T09:55:28.014+00:00',
  },
];

export const PARTNER_LOGOS: PartnerLogo[] = [
  { id: 'p1', name: 'Bandra Street Sound', role: 'Acoustic Partner' },
  { id: 'p2', name: 'Khar Cultural Warehouse', role: 'Workshop Venue' },
  { id: 'p3', name: 'Mumbai Underground Fest', role: 'Stage Partner' },
  { id: 'p4', name: 'Collegiate Hip-Hop League', role: 'Youth Circuit' },
  { id: 'p5', name: 'Suburban Jam Series', role: 'Jam Supporter' },
];

export const COMMUNITY_MEMBERS: (CommunityMember & { photoUrl: string })[] = [
  {
    id: 'mhb-1789545582012',
    name: 'Ramonnn',
    handle: '@_36_ramon',
    specialty: 'Inward Bass / Throat Tap',
    area: 'Bandra West',
    experience: '3 Years',
    voiceNoteTitle: 'Street Routine Freestyle',
    voiceNoteDuration: '1:54',
    soundType: 'bass-growl',
    avatarInitials: 'RA',
    accentBg: '#FFC93C',
    photoUrl: 'https://res.cloudinary.com/dam67zwcg/image/upload/v1789545553/mumbai-beatbox-hub/members/photos/uewn9dasat476pg2wnoz.png',
    photo_url: 'https://res.cloudinary.com/dam67zwcg/image/upload/v1789545553/mumbai-beatbox-hub/members/photos/uewn9dasat476pg2wnoz.png',
    voice_note_url: 'https://res.cloudinary.com/dam67zwcg/video/upload/v1789545561/mumbai-beatbox-hub/members/voice-notes/tlexhgrs2qhqythox8ty.mp3',
    voiceNoteUrl: 'https://res.cloudinary.com/dam67zwcg/video/upload/v1789545561/mumbai-beatbox-hub/members/voice-notes/tlexhgrs2qhqythox8ty.mp3',
    createdAt: '2026-09-16T07:59:42.012+00:00',
  },
];

export const COMMUNITY_CONTACT = {
  discord: 'https://discord.gg/9ftX9HzFKr',
  whatsappGroup: 'https://chat.whatsapp.com/EkNK2AVQnQ6E1ZsgUtbULS',
  youtube: 'https://www.youtube.com/@mumbaibeatboxhub',
  instagram: 'https://www.instagram.com/mumbai.beatbox.hub?stkn=MWpoNmY4Nnhtb3lwNw==',
  phone: '+91 72086 85628',
  phoneRaw: '+917208685628',
  phoneTel: 'tel:+917208685628',
  phoneWaUrl: 'https://wa.me/917208685628',
  secondaryPhone: '+91 84338 77879',
  secondaryPhoneRaw: '+918433877879',
  secondaryPhoneTel: 'tel:+918433877879',
  secondaryPhoneWaUrl: 'https://wa.me/918433877879',
  phoneNumbers: [
    {
      number: '+91 72086 85628',
      tel: 'tel:+917208685628',
      waUrl: 'https://wa.me/917208685628',
    },
    {
      number: '+91 84338 77879',
      tel: 'tel:+918433877879',
      waUrl: 'https://wa.me/918433877879',
    },
  ],
};
