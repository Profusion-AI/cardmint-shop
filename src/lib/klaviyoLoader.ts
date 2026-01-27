/**
 * Klaviyo Loader Utility
 *
 * Provides consent-aware loading and cleanup of Klaviyo tracking scripts.
 * Klaviyo is only loaded when marketing consent is granted.
 */

const KLAVIYO_COMPANY_ID = 'Utgrhu';
const KLAVIYO_SCRIPT_ID = 'klaviyo-script';

// localStorage keys that Klaviyo uses for tracking
const KLAVIYO_STORAGE_KEYS = [
  '__kl_key',
  'klaviyoOnsite',
  '$referrer',
  '$last_referrer',
  'kl-post-identification-sync'
];

/**
 * Dynamically load Klaviyo tracking script.
 * Only call this when marketing consent has been granted.
 */
export function loadKlaviyo(): void {
  // Prevent duplicate script injection
  if (document.getElementById(KLAVIYO_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = KLAVIYO_SCRIPT_ID;
  script.src = `https://static.klaviyo.com/onsite/js/${KLAVIYO_COMPANY_ID}/klaviyo.js?company_id=${KLAVIYO_COMPANY_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Disable Klaviyo tracking and clean up all stored data.
 * Call this when user opts out or revokes marketing consent.
 */
export function disableKlaviyo(): void {
  // Set Klaviyo's official opt-out cookie (1 year expiry)
  // Secure flag ensures cookie only sent over HTTPS
  document.cookie = '__kla_off=true; path=/; max-age=31536000; SameSite=Lax; Secure';

  // Delete tracking cookie
  document.cookie = '__kla_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure';

  // Clear Klaviyo localStorage entries
  KLAVIYO_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage may be unavailable in some contexts
    }
  });

  // Remove script element if present
  const script = document.getElementById(KLAVIYO_SCRIPT_ID);
  if (script) {
    script.remove();
  }

  // Clear Klaviyo runtime objects to prevent further tracking
  if (typeof window !== 'undefined') {
    try {
      delete (window as unknown as Record<string, unknown>).klaviyo;
      delete (window as unknown as Record<string, unknown>)._klOnsite;
    } catch {
      // Some browsers may not allow deletion
    }
  }
}

/**
 * Check if Klaviyo tracking is currently disabled via opt-out cookie.
 */
export function isKlaviyoDisabled(): boolean {
  return document.cookie.includes('__kla_off=true');
}

// TypeScript declaration for Klaviyo globals
declare global {
  interface Window {
    klaviyo?: {
      push: (args: unknown[]) => void;
    };
    /** Klaviyo onsite queue - events pushed here are processed when Klaviyo.js loads */
    _klOnsite?: unknown[][];
  }
}

/**
 * Track a Klaviyo event (consent-aware).
 * Uses the _klOnsite queue pattern so events are buffered if Klaviyo hasn't loaded yet.
 * Events are silently dropped if Klaviyo is disabled.
 *
 * @param eventName - Klaviyo metric name (e.g., 'Viewed Product')
 * @param properties - Event properties object
 */
export function trackKlaviyoEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (isKlaviyoDisabled()) return;
  if (typeof window === 'undefined') return;

  try {
    // Use queue pattern - works even before Klaviyo.js fully loads
    window._klOnsite = window._klOnsite || [];
    window._klOnsite.push(['track', eventName, properties ?? {}]);
  } catch {
    // Silently ignore tracking errors
  }
}

/**
 * Identify a user in Klaviyo (consent-aware).
 * Uses the _klOnsite queue pattern so identification is buffered if Klaviyo hasn't loaded yet.
 * Call this when user's email becomes known (e.g., on email capture).
 *
 * @param email - User's email address
 * @param properties - Additional profile properties
 */
export function identifyKlaviyoUser(email: string, properties?: Record<string, unknown>): void {
  if (isKlaviyoDisabled()) return;
  if (typeof window === 'undefined') return;
  if (!email || !email.includes('@')) return;

  try {
    // Use queue pattern - works even before Klaviyo.js fully loads
    window._klOnsite = window._klOnsite || [];
    window._klOnsite.push(['identify', { email, ...properties }]);
  } catch {
    // Silently ignore identification errors
  }
}
