import { useEffect } from "react";
import { TopBanner } from "./TopBanner";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { loadKlaviyo, disableKlaviyo } from "@/lib/klaviyoLoader";

/**
 * Layout - Wraps all pages with persistent navigation
 *
 * State scaffolding notes:
 * - cartItemCount and isLoggedIn will be populated from global state
 *   when cart/auth contexts are implemented
 * - For now, both default to their empty/logged-out states
 */

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // TODO: Get cart state from CartContext when Stripe checkout is implemented
  // const { itemCount } = useCart();

  // TODO: Get auth state from AuthContext when user accounts are implemented
  // const { isLoggedIn } = useAuth();

  // Get cookie consent state for conditional Klaviyo loading
  const { hasConsented, granularConsent } = useCookieConsent();

  // Consent-aware Klaviyo loading: only load when marketing consent is granted
  useEffect(() => {
    if (granularConsent?.marketing) {
      // User has granted marketing consent - load Klaviyo
      loadKlaviyo();
    } else if (hasConsented && !granularConsent?.marketing) {
      // User has consented but declined marketing - ensure Klaviyo is disabled
      disableKlaviyo();
    }
    // If !hasConsented, do nothing - wait for user to make a choice
  }, [hasConsented, granularConsent?.marketing]);

  return (
    <div className="min-h-screen bg-oxford-blue">
      <TopBanner
        cartItemCount={0}  // TODO: Replace with itemCount from cart context
        isLoggedIn={false} // TODO: Replace with isLoggedIn from auth context
      />
      {children}
    </div>
  );
}
