import { useState, useEffect, useCallback } from 'react';
import { disableKlaviyo } from '@/lib/klaviyoLoader';
import { disablePostHog } from '@/lib/posthogLoader';

export type ConsentLevel = 'all' | 'necessary' | 'none' | 'custom';

export type CookieCategory = 'essential' | 'performance' | 'preference' | 'marketing';

export interface GranularConsent {
  essential: boolean;  // Always true, cannot be toggled
  performance: boolean;
  preference: boolean;
  marketing: boolean;
}

interface CookieConsentState {
  hasConsented: boolean;
  consentLevel: ConsentLevel | null;
  granularConsent: GranularConsent | null;
  gpcDetected: boolean;
}

const CONSENT_KEY = 'cookieConsent';
const CONSENT_TIMESTAMP_KEY = 'cookieConsentTimestamp';
const SESSION_OPTOUT_KEY = 'cookieConsentSession';
const GRANULAR_KEY = 'cookieConsentGranular';
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

// Convert legacy consent levels to granular consent
function levelToGranular(level: ConsentLevel): GranularConsent {
  switch (level) {
    case 'all':
      return { essential: true, performance: true, preference: true, marketing: true };
    case 'necessary':
    case 'none':
      return { essential: true, performance: false, preference: false, marketing: false };
    case 'custom':
    default:
      return { essential: true, performance: false, preference: false, marketing: false };
  }
}

// Convert granular consent back to a level for backward compatibility
function granularToLevel(consent: GranularConsent): ConsentLevel {
  if (consent.performance && consent.preference && consent.marketing) {
    return 'all';
  }
  if (!consent.performance && !consent.preference && !consent.marketing) {
    return 'necessary';
  }
  return 'custom';
}

function getGranularConsentIfValid(): GranularConsent | null {
  const granularStr = localStorage.getItem(GRANULAR_KEY);
  const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);

  if (granularStr && timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed > SIX_MONTHS_MS) {
      localStorage.removeItem(GRANULAR_KEY);
      return null;
    }
    try {
      return JSON.parse(granularStr) as GranularConsent;
    } catch {
      return null;
    }
  }
  return null;
}

function getConsentIfValid(): ConsentLevel | null {
  // Check localStorage first (persistent consent)
  const consent = localStorage.getItem(CONSENT_KEY);
  const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);

  if (consent && timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed > SIX_MONTHS_MS) {
      // Expired - clear and return null
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
      return null;
    }
    return consent as ConsentLevel;
  }

  // Check sessionStorage for opt-out flag
  const sessionOptOut = sessionStorage.getItem(SESSION_OPTOUT_KEY);
  if (sessionOptOut === 'opted_out') {
    return 'none';
  }

  return null;
}

// Check if GPC (Global Privacy Control) is enabled in the browser
function isGpcEnabled(): boolean {
  return typeof navigator !== 'undefined' &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function useCookieConsent() {
  const [state, setState] = useState<CookieConsentState>(() => {
    const consentLevel = getConsentIfValid();
    const granularConsent = getGranularConsentIfValid() ||
      (consentLevel ? levelToGranular(consentLevel) : null);
    return {
      hasConsented: consentLevel !== null,
      consentLevel,
      granularConsent,
      gpcDetected: isGpcEnabled(),
    };
  });

  // Re-check on mount (handles SSR hydration edge cases)
  // GPC (Global Privacy Control) is detected but NOT auto-applied - we show the modal
  // with GPC info so users can see their browser preference and choose to override
  useEffect(() => {
    const consentLevel = getConsentIfValid();
    const granularConsent = getGranularConsentIfValid() ||
      (consentLevel ? levelToGranular(consentLevel) : null);
    const gpcEnabled = isGpcEnabled();

    // Note: We no longer auto-apply consent when GPC is detected.
    // Instead, we expose gpcDetected so the UI can inform users about their
    // browser privacy preference while still showing the consent modal.
    // This ensures the GameBoy modal (a brand element) is visible to all users.

    setState({
      hasConsented: consentLevel !== null,
      consentLevel,
      granularConsent,
      gpcDetected: gpcEnabled,
    });
  }, []);

  const setConsent = useCallback((choice: ConsentLevel) => {
    const granularConsent = levelToGranular(choice);

    // Store all consent choices in localStorage with timestamp for 6-month expiry
    // This includes 'none' to respect user's decline and avoid re-nagging
    localStorage.setItem(CONSENT_KEY, choice);
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(GRANULAR_KEY, JSON.stringify(granularConsent));
    // Clear any legacy session opt-out
    sessionStorage.removeItem(SESSION_OPTOUT_KEY);

    // If user declined marketing consent, ensure Klaviyo is disabled
    if (!granularConsent.marketing) {
      disableKlaviyo();
    }

    // If user declined performance consent, ensure PostHog is disabled
    if (!granularConsent.performance) {
      disablePostHog();
    }

    setState({
      hasConsented: true,
      consentLevel: choice,
      granularConsent,
    });
  }, []);

  const setGranularConsent = useCallback((consent: GranularConsent) => {
    // Ensure essential is always true
    const safeConsent: GranularConsent = { ...consent, essential: true };
    const level = granularToLevel(safeConsent);

    localStorage.setItem(CONSENT_KEY, level);
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(GRANULAR_KEY, JSON.stringify(safeConsent));
    sessionStorage.removeItem(SESSION_OPTOUT_KEY);

    // If user disabled marketing consent, ensure Klaviyo is disabled and cleaned up
    if (!safeConsent.marketing) {
      disableKlaviyo();
    }

    // If user disabled performance consent, ensure PostHog is disabled and cleaned up
    if (!safeConsent.performance) {
      disablePostHog();
    }

    setState({
      hasConsented: true,
      consentLevel: level,
      granularConsent: safeConsent,
    });
  }, []);

  const clearConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
    localStorage.removeItem(GRANULAR_KEY);
    sessionStorage.removeItem(SESSION_OPTOUT_KEY);
    setState({
      hasConsented: false,
      consentLevel: null,
      granularConsent: null,
    });
  }, []);

  return {
    hasConsented: state.hasConsented,
    consentLevel: state.consentLevel,
    granularConsent: state.granularConsent,
    gpcDetected: state.gpcDetected,
    setConsent,
    setGranularConsent,
    clearConsent,
  };
}
