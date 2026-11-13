import { EventItem, VideoItem } from '../types';
import { COMMUNITY_CONTACT } from './communityData';

export interface PageSeoMeta {
  title: string;
  description: string;
  path: string;
  keywords: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
}

export const SITE_BRAND = {
  name: 'Mumbai Beatbox Hub',
  alternateName: 'MBH',
  email: 'mumbai.beatbox.hub@gmail.com',
  instagramHandle: '@mumbai.beatbox.hub',
  instagramUrl: COMMUNITY_CONTACT.instagram,
  youtubeUrl: COMMUNITY_CONTACT.youtube,
  whatsappUrl: COMMUNITY_CONTACT.whatsappGroup,
  discordUrl: COMMUNITY_CONTACT.discord,
  defaultOgImage: '/assets/og-mumbai-beatbox-hub.jpg',
  defaultLogo: '/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png',
  locality: 'Mumbai',
  region: 'Maharashtra',
  country: 'India',
  countryCode: 'IN',
};

/**
 * Resolves the canonical base URL.
 * Prefers VITE_SITE_URL when configured; otherwise resolves runtime origin and normalizes HTTP -> HTTPS in production.
 */
export function getSiteBaseUrl(): string {
  const envSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (origin.startsWith('http://') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
    }
    return origin.replace(/\/+$/, '');
  }

  return 'https://mumbaibeatboxhub.com';
}

export function buildCanonicalUrl(path: string, baseUrl: string = getSiteBaseUrl()): string {
  const cleanPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `${baseUrl}${cleanPath}`;
}

export function buildAssetUrl(assetPath: string, baseUrl: string = getSiteBaseUrl()): string {
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${baseUrl}${normalized}`;
}

export const PAGE_SEO: Record<string, PageSeoMeta> = {
  home: {
    path: '/',
    title: 'Mumbai Beatbox Hub | Beatboxing in Mumbai & Community',
    description:
      'Discover Mumbai Beatbox Hub, the Mumbai beatbox community for beatboxing in Mumbai, beatbox events, battles, workshops, and live performances in India.',
    keywords:
      'Mumbai Beatbox Hub, Beatboxing in Mumbai, Mumbai Beatbox Community, Beatbox Community in Mumbai, Beatboxers in Mumbai, Beatbox Events in Mumbai, Beatbox Battles in Mumbai, Indian Beatbox Community, Beatboxing India, Beatbox Championship Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub - Mumbai Beatbox Community, Cyphers & Events',
  },
  about: {
    path: '/about',
    title: 'About Mumbai Beatbox Community | Mumbai Beatbox Hub',
    description:
      'Learn about the Mumbai Beatbox Hub community driving Mumbai beatbox culture, beatboxing India, weekly cyphers, and beginner beatbox workshops in Mumbai.',
    keywords:
      'Mumbai Beatbox Community, Beatbox Community in Mumbai, Mumbai Beatbox Hub community, Beatbox music community, Beatbox culture in India, Mumbai beatbox culture, Beatboxing India, Mumbai Beatbox Hub workshops, Beatbox workshops for beginners in Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub Community & Mumbai Beatbox Culture',
  },
  events: {
    path: '/events',
    title: 'Upcoming Beatbox Events in Mumbai | Mumbai Beatbox Hub',
    description:
      'Explore Mumbai Beatbox Hub events: upcoming beatbox events in Mumbai, beatbox battles, meetups, cyphers, and beatbox competitions in India.',
    keywords:
      'Beatbox Events in Mumbai, Upcoming beatbox events in Mumbai, Mumbai Beatbox Hub events, Beatbox Battles in Mumbai, Beatbox competitions in Mumbai, Beatbox workshops in Mumbai, Beatbox meetups Mumbai, Beatbox competitions near me, Beatbox events and competitions in India',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Upcoming Beatbox Events, Meetups & Competitions in Mumbai',
  },
  championship2026: {
    path: '/mumbai-beatbox-championship-2026',
    title: 'Mumbai Beatbox Championship 2026 | Beatbox Battle Mumbai',
    description:
      'Official Mumbai Beatbox Hub championship page for Mumbai Beatbox Championship 2026 — a premier beatbox competition and tournament in India.',
    keywords:
      'Mumbai Beatbox Championship 2026, Beatbox Championship Mumbai, Beatbox Championship India, Mumbai Beatbox Competition, Beatbox Battle Mumbai 2026, Beatbox Tournament India, Beatbox Events December 2026, Beatbox Competition Mumbai December 2026, Mumbai Beatbox Hub championship',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Championship 2026 - Beatbox Battle Mumbai & Tournament India',
  },
  gallery: {
    path: '/gallery',
    title: 'Beatbox Cypher Mumbai Gallery | Mumbai Beatbox Hub',
    description:
      'Explore live photography from Mumbai beatbox meetups, beatbox cypher Mumbai sessions, live beatbox battles, and Mumbai beatbox culture highlights.',
    keywords:
      'Beatbox cypher Mumbai, Beatbox meetups Mumbai, Mumbai beatbox culture, Beatbox Battles in Mumbai, Beatboxers in Mumbai, Beatboxing in Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub Cypher & Live Beatbox Performance Photo Archive',
  },
  videos: {
    path: '/videos',
    title: 'Live Beatbox Performances & Battles | Mumbai Beatbox Hub',
    description:
      'Watch live beatbox performances in Mumbai, showcase routines by Indian beatboxers, and filmed beatbox battles from the Indian beatbox community.',
    keywords:
      'Beatbox performances Mumbai, Live beatbox performances, Beatbox Battles in Mumbai, Indian beatboxers, Beatbox artists in Mumbai, Indian Beatbox Community',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Live Beatbox Performances & Battle Videos — Mumbai Beatbox Hub',
  },
  members: {
    path: '/members',
    title: 'Meet Beatboxers in Mumbai | Mumbai Beatbox Artists Roster',
    description:
      'Meet beatboxers in Mumbai and Indian beatboxers in the Mumbai Beatbox Hub community. Discover beatbox artists in Mumbai and hear live voice notes.',
    keywords:
      'Beatboxers in Mumbai, Beatbox artists in Mumbai, Meet beatboxers in Mumbai, Indian beatboxers, Mumbai Beatbox Community, Beatbox music community',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Beatboxers and Vocal Percussion Artists in Mumbai',
  },
  contact: {
    path: '/contact',
    title: 'Join Beatbox Community in Mumbai | Mumbai Beatbox Hub',
    description:
      'Join a beatbox community in Mumbai, discover where to learn beatboxing in Mumbai, attend workshops, or connect with Mumbai Beatbox Hub Instagram.',
    keywords:
      'Join a beatbox community in Mumbai, Where to learn beatboxing in Mumbai, Beatbox workshops for beginners in Mumbai, Mumbai Beatbox Hub Instagram, Mumbai Beatbox Hub workshops',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Join Mumbai Beatbox Hub Community & Workshops',
  },
  blog: {
    path: '/blog',
    title: 'Beatboxing in Mumbai & India Blog | Mumbai Beatbox Hub',
    description:
      'Guides on where to learn beatboxing in Mumbai, how to participate in beatbox battles, Indian beatboxers, and upcoming beatbox events in India.',
    keywords:
      'Beatboxing in Mumbai, Where to learn beatboxing in Mumbai, How to participate in beatbox battles, Beatbox culture in India, Indian beatboxers, Beatbox events and competitions in India',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub Blog - Guides, Culture & Scene Updates',
  },
};

export function buildOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: SITE_BRAND.name,
    alternateName: SITE_BRAND.alternateName,
    url: `${baseUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: buildAssetUrl(SITE_BRAND.defaultLogo, baseUrl),
    },
    image: buildAssetUrl(SITE_BRAND.defaultOgImage, baseUrl),
    description: PAGE_SEO.home.description,
    email: SITE_BRAND.email,
    sameAs: [
      SITE_BRAND.instagramUrl,
      SITE_BRAND.youtubeUrl,
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_BRAND.locality,
      addressRegion: SITE_BRAND.region,
      addressCountry: SITE_BRAND.countryCode,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'community inquiries',
        email: SITE_BRAND.email,
        availableLanguage: ['English', 'Hindi', 'Marathi'],
        areaServed: 'IN',
      },
    ],
  };
}

export function buildWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: SITE_BRAND.name,
    alternateName: SITE_BRAND.alternateName,
    url: `${baseUrl}/`,
    description: PAGE_SEO.home.description,
    inLanguage: 'en',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(baseUrl: string, entries: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: entry.name,
      item: buildCanonicalUrl(entry.path, baseUrl),
    })),
  };
}

/**
 * Generates Schema.org Event JSON-LD strictly from confirmed event fields.
 * Never fabricates dates, street addresses, prices, or ratings.
 */
export function buildEventSchema(baseUrl: string, event: EventItem, pagePath: string = '/events') {
  const hasConfirmedDate = Boolean(event.date && /^\d{4}-\d{2}-\d{2}/.test(event.date.trim()));
  if (!hasConfirmedDate || !event.venue || !(event.title || event.name)) {
    return null;
  }

  const eventTitle = event.title || event.name;
  const eventDescription = (event.description || event.blurb || '').trim();
  const regUrl = event.registrationUrl || event.registration_url || buildCanonicalUrl(pagePath, baseUrl);
  const coverImage = event.coverImageUrl || event.cover_image_url;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventTitle,
    startDate: event.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus:
      event.registrationStatus === 'closed'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location || event.area || SITE_BRAND.locality,
        addressRegion: SITE_BRAND.region,
        addressCountry: SITE_BRAND.countryCode,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      url: `${baseUrl}/`,
    },
    url: regUrl,
  };

  if (eventDescription) {
    schema.description = eventDescription;
  }
  if (coverImage) {
    schema.image = [buildAssetUrl(coverImage, baseUrl)];
  } else {
    schema.image = [buildAssetUrl(SITE_BRAND.defaultOgImage, baseUrl)];
  }

  // Only emit free offer when explicitly confirmed as Free in entry field; do not invent numeric prices
  if (event.entry && /free/i.test(event.entry)) {
    schema.isAccessibleForFree = true;
    schema.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability:
        event.registrationStatus === 'full' || event.registrationStatus === 'closed'
          ? 'https://schema.org/SoldOut'
          : event.registrationStatus === 'coming_soon'
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/InStock',
      url: regUrl,
    };
  }

  return schema;
}

/**
 * Converts duration like "03:45" or "1:30 sec" into ISO 8601 duration when reliably parseable.
 */
function toIsoDuration(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);
  if (Number.isNaN(mins) || Number.isNaN(secs)) return undefined;
  return `PT${mins}M${secs}S`;
}

export function buildVideoObjectSchema(baseUrl: string, video: VideoItem) {
  if (!video.title || !video.videoUrl) return null;

  const thumbnailUrl = video.thumbnailUrl
    ? buildAssetUrl(video.thumbnailUrl, baseUrl)
    : buildAssetUrl(SITE_BRAND.defaultOgImage, baseUrl);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: `${video.title} performed by ${video.performer} (${video.venue}) — featured in the ${SITE_BRAND.name} community video archive.`,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: video.createdAt || undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      url: `${baseUrl}/`,
    },
  };

  if (/youtu\.be|youtube\.com/i.test(video.videoUrl)) {
    const ytMatch = video.videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
    );
    if (ytMatch?.[1]) {
      schema.embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
    } else {
      schema.contentUrl = video.videoUrl;
    }
  } else {
    schema.contentUrl = video.videoUrl;
  }

  const isoDuration = toIsoDuration(video.duration);
  if (isoDuration) {
    schema.duration = isoDuration;
  }

  return schema;
}
