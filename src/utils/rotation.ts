/**
 * Sequence rotation utility for Mumbai Beatbox Hub
 * Enables cyclic rotation on page refresh so that all community members
 * and all gallery mosaic items receive equal spotlight across visits.
 */

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getCoprimeStep(len: number): number {
  if (len <= 2) return 1;
  const candidates = [3, 5, 7, 11, 13, 2];
  for (const c of candidates) {
    if (c < len && gcd(c, len) === 1) return c;
  }
  return 1;
}

/**
 * Cyclically rotates an array on each page load/refresh using sessionStorage.
 * Advances the offset by a coprime step on each reload so that every member
 * and gallery item cycles through the lead/hero positions over successive visits.
 */
export function rotateSequenceOnRefresh<T>(items: T[], sessionKey: string): T[] {
  if (!items || items.length <= 1) return items;
  
  const step = getCoprimeStep(items.length);
  let offset = 0;

  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(sessionKey) : null;
    if (raw !== null) {
      const prev = parseInt(raw, 10);
      offset = ((isNaN(prev) ? 0 : prev) + step) % items.length;
    } else {
      // First session visit: pick a non-zero starting offset or random so order is varied from default
      offset = Math.floor(Math.random() * items.length);
    }
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(sessionKey, String(offset));
    }
  } catch {
    // If sessionStorage is restricted (e.g. sandbox iframe), fallback to random offset
    offset = Math.floor(Math.random() * items.length);
  }

  return [...items.slice(offset), ...items.slice(0, offset)];
}

/**
 * Manually rotates an array forward by one coprime step, used when the user clicks "Rotate".
 */
export function manualRotate<T>(items: T[], customStep?: number): T[] {
  if (!items || items.length <= 1) return items;
  const step = customStep ?? getCoprimeStep(items.length);
  const actualStep = step % items.length || 1;
  return [...items.slice(actualStep), ...items.slice(0, actualStep)];
}
