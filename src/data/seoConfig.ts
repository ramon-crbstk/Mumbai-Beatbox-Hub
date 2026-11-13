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
    title: "Mumbai Beatbox Hub | Mumbai's Beatboxing Community & Events",
    description:
      'Discover Mumbai Beatbox Hub, a community dedicated to growing beatboxing culture in Mumbai through beatbox battles, events, workshops, artist showcases and community initiatives.',
    keywords:
      'Mumbai Beatbox Hub, Beatboxing Mumbai, Mumbai Beatbox Championship 2026, Beatbox battles Mumbai, Beatbox community India, Beatbox events Mumbai, Indian beatbox culture, Hip-hop events Mumbai, Beatbox workshops Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: "Mumbai Beatbox Hub - Mumbai's Beatboxing Community, Cyphers & Events",
  },
  about: {
    path: '/about',
    title: 'About Mumbai Beatbox Hub | Vocal Percussion Collective',
    description:
      'Learn about Mumbai Beatbox Hub (MBH), our grassroots beatboxing community in Mumbai, Maharashtra, weekly cyphers, workshops, and hip-hop culture.',
    keywords:
      'About Mumbai Beatbox Hub, Beatboxing community in Mumbai, Mumbai hip-hop community, Beatbox community India, Indian beatboxers, vocal percussion Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'About Mumbai Beatbox Hub - Grassroots Vocal Percussion Collective',
  },
  events: {
    path: '/events',
    title: 'Beatbox Events & Cyphers in Mumbai | Mumbai Beatbox Hub',
    description:
      'Explore upcoming beatbox events, open cyphers, beatbox battles, and beatbox workshops in Mumbai, Maharashtra. RSVP online to join the circle.',
    keywords:
      'Beatbox events Mumbai, Beatbox events India, Beatbox battles Mumbai, Beatbox workshops Mumbai, Hip-hop events Mumbai, Mumbai Beatbox Championship 2026',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Upcoming Beatbox Events, Cyphers & Workshops in Mumbai',
  },
  championship2026: {
    path: '/mumbai-beatbox-championship-2026',
    title: 'Mumbai Beatbox Championship 2026 | Official MBH Page',
    description:
      'Official hub for Mumbai Beatbox Championship 2026. Stay updated on verified battle dates, Mumbai venue announcements, rules, and registrations.',
    keywords:
      'Mumbai Beatbox Championship 2026, Beatbox competitions in India, Beatbox battles in Mumbai, Mumbai Beatbox Hub, Indian beatboxers, Andheri Mumbai beatbox',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Championship 2026 - Official Mumbai Beatbox Hub Page',
  },
  gallery: {
    path: '/gallery',
    title: 'Mumbai Beatbox Gallery | Cypher & Battle Photo Archive',
    description:
      'Browse authentic street photography from Mumbai Beatbox Hub cyphers, live beatbox battles, workshops, and hip-hop events across Mumbai, India.',
    keywords:
      'Mumbai Beatbox Gallery, Beatboxing in Mumbai photos, Mumbai hip-hop culture, Beatbox battles Mumbai, Carter Road beatbox cypher',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub 35mm Cypher & Battle Photo Archive',
  },
  videos: {
    path: '/videos',
    title: 'Beatbox Videos & Battle Routines | Mumbai Beatbox Hub',
    description:
      'Watch live beatbox battles, vocal percussion showcases, and technical routine drops featuring Indian beatboxers and the Mumbai community.',
    keywords:
      'Indian beatboxers videos, Beatbox battles Mumbai, Beatboxing in Mumbai routines, Mumbai Beatbox Hub videos, vocal percussion showcase',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub Featured Videos & Battle Routines',
  },
  members: {
    path: '/members',
    title: 'Mumbai Beatboxers & Community Roster | MBH Artists',
    description:
      'Meet Indian beatboxers and vocal percussionists from the Mumbai Beatbox Hub community. Listen to artist voice notes and explore sound styles.',
    keywords:
      'Indian beatboxers, Mumbai beatboxers, Beatbox community in India, Mumbai Beatbox Hub members, inward bass, liproll artists Mumbai',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Mumbai Beatbox Hub Community Roster & Vocal Artists',
  },
  contact: {
    path: '/contact',
    title: 'Contact Mumbai Beatbox Hub | Join Cyphers & Book',
    description:
      'Connect with Mumbai Beatbox Hub in Mumbai, Maharashtra. Join weekend cyphers, inquire about workshops, or email mumbai.beatbox.hub@gmail.com.',
    keywords:
      'Contact Mumbai Beatbox Hub, Join beatbox community Mumbai, Beatbox workshops Mumbai booking, mumbai.beatbox.hub@gmail.com',
    ogType: 'website',
    ogImage: '/assets/og-mumbai-beatbox-hub.jpg',
    ogImageAlt: 'Contact Mumbai Beatbox Hub - Join Mumbai Cyphers & Book Workshops',
  },
  blog: {
    path: '/blog',
    title: 'Mumbai Beatbox Blog | Beatboxing Guides & Scene News',
    description:
      'Read original guides on beatboxing in Mumbai, beginner vocal percussion techniques, Indian beatboxers, and beatbox events across India.',
    keywords:
      'Beatboxing Mumbai blog, Growth of Beatboxing Culture in Mumbai, What is beatboxing beginners guide, Indian beatboxers, Mumbai Beatbox Championship 2026',
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
  if (!event.date || !event.venue || !(event.title || event.name)) {
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
