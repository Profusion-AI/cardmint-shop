import { useState, useEffect, useCallback } from 'react';

/**
 * useEmailCapture - Manages email subscription state across the app
 *
 * Tracks whether the user has subscribed or dismissed the email capture
 * to prevent re-showing popups unnecessarily.
 *
 * localStorage keys:
 * - cardmint_email_subscribed: "true" if user has subscribed (never show popup again)
 * - cardmint_email_dismissed_at: timestamp when user dismissed (don't show for 7 days)
 *
 * Cross-component sync:
 * - Uses custom events to sync state across hook instances in the same tab
 * - When markSubscribed() or markDismissed() is called, all instances update
 */

const SUBSCRIBED_KEY = 'cardmint_email_subscribed';
const DISMISSED_KEY = 'cardmint_email_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Custom event names for cross-component state sync
const EMAIL_SUBSCRIBED_EVENT = 'cardmint:email-subscribed';
const EMAIL_DISMISSED_EVENT = 'cardmint:email-dismissed';

interface EmailCaptureState {
  isSubscribed: boolean;
  canShowPopup: boolean;
}

function getInitialState(): EmailCaptureState {
  if (typeof window === 'undefined') {
    return { isSubscribed: false, canShowPopup: false };
  }

  const isSubscribed = localStorage.getItem(SUBSCRIBED_KEY) === 'true';
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);

  let canShowPopup = true;

  // Never show popup if already subscribed
  if (isSubscribed) {
    canShowPopup = false;
  }
  // Don't show popup if dismissed within last 7 days
  else if (dismissedAt) {
    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed < DISMISS_DURATION_MS) {
      canShowPopup = false;
    } else {
      // Clear expired dismissal
      localStorage.removeItem(DISMISSED_KEY);
    }
  }

  return { isSubscribed, canShowPopup };
}

export function useEmailCapture() {
  const [state, setState] = useState<EmailCaptureState>(getInitialState);

  // Re-check on mount and listen for cross-component sync events
  useEffect(() => {
    setState(getInitialState());

    // Listen for subscription events from other hook instances
    const handleSubscribed = () => {
      setState({ isSubscribed: true, canShowPopup: false });
    };

    const handleDismissed = () => {
      setState((prev) => ({ ...prev, canShowPopup: false }));
    };

    window.addEventListener(EMAIL_SUBSCRIBED_EVENT, handleSubscribed);
    window.addEventListener(EMAIL_DISMISSED_EVENT, handleDismissed);

    return () => {
      window.removeEventListener(EMAIL_SUBSCRIBED_EVENT, handleSubscribed);
      window.removeEventListener(EMAIL_DISMISSED_EVENT, handleDismissed);
    };
  }, []);

  /**
   * Call this when user successfully subscribes
   * Permanently prevents popup from showing again
   * Dispatches event to sync all hook instances
   */
  const markSubscribed = useCallback(() => {
    localStorage.setItem(SUBSCRIBED_KEY, 'true');
    localStorage.removeItem(DISMISSED_KEY);
    setState({ isSubscribed: true, canShowPopup: false });
    // Notify other hook instances in same tab
    window.dispatchEvent(new Event(EMAIL_SUBSCRIBED_EVENT));
  }, []);

  /**
   * Call this when user dismisses the popup without subscribing
   * Prevents popup from showing for 7 days
   * Dispatches event to sync all hook instances
   */
  const markDismissed = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setState((prev) => ({ ...prev, canShowPopup: false }));
    // Notify other hook instances in same tab
    window.dispatchEvent(new Event(EMAIL_DISMISSED_EVENT));
  }, []);

  /**
   * Clear subscription state (for testing/debugging)
   */
  const clearState = useCallback(() => {
    localStorage.removeItem(SUBSCRIBED_KEY);
    localStorage.removeItem(DISMISSED_KEY);
    setState({ isSubscribed: false, canShowPopup: true });
  }, []);

  return {
    isSubscribed: state.isSubscribed,
    canShowPopup: state.canShowPopup,
    markSubscribed,
    markDismissed,
    clearState,
  };
}
