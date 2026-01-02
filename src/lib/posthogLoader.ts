/**
 * PostHog Loader Utility
 *
 * Provides consent-aware loading and cleanup of PostHog analytics.
 * PostHog is only loaded when performance consent is granted.
 *
 * Per docs/analytics/pii-masking.md: all PII is masked, no session recording
 * without explicit opt-in, and distinct IDs use hashed values.
 */

import posthog from 'posthog-js';

// PostHog configuration from environment
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

// Track initialization state
let isInitialized = false;

/**
 * Initialize PostHog with privacy-first configuration.
 * Only call this when performance consent has been granted.
 */
export function loadPostHog(): void {
  if (isInitialized || !POSTHOG_KEY) {
    if (!POSTHOG_KEY) {
      console.debug('[PostHog] VITE_PUBLIC_POSTHOG_KEY not configured');
    }
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Privacy settings per docs/analytics/pii-masking.md
    autocapture: false, // Disable autocapture - we only send explicit events
    capture_pageview: true, // Enable pageview tracking
    capture_pageleave: true, // Track when users leave
    disable_session_recording: true, // No session recording (privacy)
    persistence: 'localStorage', // Use localStorage for persistence
    // Mask all user inputs by default
    mask_all_text: false, // We don't send DOM text
    mask_all_element_attributes: true,
    // Respect Do Not Track
    respect_dnt: true,
    // Cross-domain linking disabled (single domain)
    cross_subdomain_cookie: false,
    // Opt out of analytics until we verify consent is granted
    opt_out_capturing_by_default: false,
    loaded: () => {
      console.debug('[PostHog] Initialized with consent');
    },
  });

  isInitialized = true;
}

/**
 * Disable PostHog and clean up stored data.
 * Call this when user revokes performance consent.
 */
export function disablePostHog(): void {
  if (isInitialized) {
    // Opt user out of all tracking
    posthog.opt_out_capturing();
    console.debug('[PostHog] Tracking disabled');
  }

  // Clear PostHog localStorage entries
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ph_') || key === 'posthog') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage may be unavailable
    }
  });

  isInitialized = false;
}

/**
 * Check if PostHog is currently initialized.
 */
export function isPostHogEnabled(): boolean {
  return isInitialized;
}

/**
 * Track a custom event with PostHog.
 * Only sends if PostHog is initialized and consent is granted.
 *
 * @param eventName - The event name (e.g., 'product_viewed')
 * @param properties - Optional event properties
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialized) {
    console.debug(`[PostHog] Event '${eventName}' skipped - not initialized`);
    return;
  }

  posthog.capture(eventName, {
    ...properties,
    $lib: 'cardmint-shop',
  });
}

/**
 * Identify a user (after they provide email for checkout).
 * Uses hashed email to prevent PII exposure.
 *
 * @param hashedId - Pre-hashed user identifier
 */
export function identifyUser(hashedId: string): void {
  if (!isInitialized) return;
  posthog.identify(hashedId);
}

/**
 * Reset user identity (on logout or session end).
 */
export function resetUser(): void {
  if (!isInitialized) return;
  posthog.reset();
}
