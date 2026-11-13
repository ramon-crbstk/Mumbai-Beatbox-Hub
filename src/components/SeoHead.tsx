import { useEffect } from 'react';
import {
  BreadcrumbEntry,
  buildAssetUrl,
  buildBreadcrumbSchema,
  buildCanonicalUrl,
  buildOrganizationSchema,
  buildWebsiteSchema,
  getSiteBaseUrl,
  PageSeoMeta,
  SITE_BRAND,
} from '../data/seoConfig';
import { trackPageView } from '../lib/analytics';

interface SeoHeadProps {
  meta: PageSeoMeta;
  breadcrumbs?: BreadcrumbEntry[];
  structuredData?: Record<string, unknown>[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SeoHead({ meta, breadcrumbs, structuredData = [] }: SeoHeadProps) {
  useEffect(() => {
    const baseUrl = getSiteBaseUrl();
    const canonicalUrl = buildCanonicalUrl(meta.path, baseUrl);
    const ogImageUrl = buildAssetUrl(meta.ogImage || SITE_BRAND.defaultOgImage, baseUrl);

    // 1. Page Title
    document.title = meta.title;

    // 2. Standard Meta Tags
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'keywords', meta.keywords);
    upsertMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // 3. Canonical URL (HTTPS)
    upsertLink('canonical', canonicalUrl);

    // 4. Open Graph Metadata (Facebook, WhatsApp, LinkedIn)
    upsertMeta('property', 'og:type', meta.ogType || 'website');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', SITE_BRAND.name);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:image', ogImageUrl);
    upsertMeta('property', 'og:image:alt', meta.ogImageAlt || meta.title);

    // 5. Twitter / X Card Metadata
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', ogImageUrl);

    // 6. Dynamic JSON-LD Structured Data
    const existingScripts = document.head.querySelectorAll('script[data-mbh-seo="true"]');
    existingScripts.forEach((node) => node.remove());

    if (!meta.noindex) {
      const schemas: Record<string, unknown>[] = [
        buildOrganizationSchema(baseUrl),
        buildWebsiteSchema(baseUrl),
      ];

      if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push(buildBreadcrumbSchema(baseUrl, breadcrumbs));
      }

      for (const schema of structuredData) {
        if (schema) {
          schemas.push(schema);
        }
      }

      schemas.forEach((schemaObj) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-mbh-seo', 'true');
        script.textContent = JSON.stringify(schemaObj);
        document.head.appendChild(script);
      });
    }

    // 7. Track page view in GA4 if configured
    trackPageView(meta.path, meta.title);
  }, [meta, breadcrumbs, structuredData]);

  return null;
}
