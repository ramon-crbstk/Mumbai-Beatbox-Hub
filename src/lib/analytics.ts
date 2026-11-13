/**
 * Privacy-safe, environment-driven Google Analytics 4 (GA4) utility
 * for Mumbai Beatbox Hub (MBH).
 *
 * Zero tracking IDs or verification tokens are hardcoded in source code.
 * Set VITE_GA4_MEASUREMENT_ID in your deployment environment variables
 * (e.g. G-XXXXXXXXXX) to activate organic traffic and event tracking.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __mbhGaInitialized?: boolean;
  }
}

export function getGaMeasurementId(): string {
  const id = (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined)?.trim() || '';
  // Validate standard GA4 measurement ID format (G-XXXXXXXXXX)
  return /^G-[A-Z0-9]+$/i.test(id) ? id : '';
}

/**
 * Lazily injects GA4 gtag.js after initial render when VITE_GA4_MEASUREMENT_ID is present.
 * Never blocks LCP or initial hydration.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;
  const measurementId = getGaMeasurementId();
  if (!measurementId || window.__mbhGaInitialized) return;

  window.__mbhGaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // Tracked explicitly on route change via trackPageView
    anonymize_ip: true,
  });

  const loadScript = () => {
    if (document.querySelector(`script[data-ga-id="${measurementId}"]`)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.setAttribute('data-ga-id', measurementId);
    document.head.appendChild(script);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadScript, { timeout: 2500 });
  } else {
    setTimeout(loadScript, 1500);
  }
}

/**
 * Records a page view for SPA navigation across /, /about, /events, /mumbai-beatbox-championship-2026, etc.
 */
export function trackPageView(path: string, title: string): void {
  if (typeof window === 'undefined') return;
  const measurementId = getGaMeasurementId();
  if (!measurementId || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path,
  });
}

/**
 * Tracks meaningful user interactions (RSVP, contact dispatch, video play, championship inquiry).
 */
export function trackSeoEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  const measurementId = getGaMeasurementId();
  if (!measurementId || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params || {});
}
