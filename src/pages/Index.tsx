import { Hero } from "@/components/Hero";
import { ValueProps } from "@/components/ValueProps";
import { VaultCarousel } from "@/components/VaultCarousel";
import { EmailCapture } from "@/components/EmailCapture";
import { Footer } from "@/components/Footer";
import { GameBoyDialog } from "@/components/GameBoyDialog";
import { CookiePreferenceCenter } from "@/components/CookiePreferenceCenter";
import { useEffect, useState } from "react";
import { getPage, type PageData } from "@/lib/gql";
import { renderWidgets } from "@/lib/widgetAdapter";
import { useCookieConsent, type GranularConsent } from "@/hooks/useCookieConsent";

const Index = () => {
  const [page, setPage] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCookieDialog, setShowCookieDialog] = useState(false);
  const [showPreferenceCenter, setShowPreferenceCenter] = useState(false);
  const { hasConsented, setConsent, granularConsent, setGranularConsent, gpcDetected } = useCookieConsent();

  useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();
    getPage("home", { signal: ctrl.signal })
      .then((p) => {
        if (!aborted) {
          setPage(p);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!aborted) {
          setError(e?.message || "Failed to load page");
          setLoading(false);
        }
      });
    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, []);

  // Show cookie consent dialog after 500ms delay (if not already consented)
  useEffect(() => {
    if (hasConsented) return;
    const timer = setTimeout(() => setShowCookieDialog(true), 500);
    return () => clearTimeout(timer);
  }, [hasConsented]);

  // CMS content available and has widgets - render dynamic
  const hasCmsContent = page && page.widgets && page.widgets.length > 0;

  return (
    <>
      {hasCmsContent ? (
        <>
          {/* Dynamic CMS-driven content */}
          <div className="opacity-0 animate-in fade-in duration-300 fill-mode-forwards">
            {renderWidgets(page.widgets)}
          </div>
          <Footer />
        </>
      ) : (
        <>
          {/* Static fallback (loading, error, or empty CMS) */}
          <Hero />
          <ValueProps />
          <VaultCarousel />
          <EmailCapture />
          {loading && (
            <div className="sr-only" aria-live="polite">Loading page content...</div>
          )}
          {error && (
            <div className="sr-only" aria-live="polite">Using static content (CMS unavailable)</div>
          )}
          <Footer />
        </>
      )}

      {/* Cookie consent dialog - appears after 500ms on first visit */}
      <GameBoyDialog
        visible={showCookieDialog}
        gpcPreset={gpcDetected}
        onClose={() => setShowCookieDialog(false)}
        onCookieChoice={(choice) => {
          setConsent(choice);
          setShowCookieDialog(false);
        }}
        onOpenPreferences={() => {
          setShowCookieDialog(false);
          setShowPreferenceCenter(true);
        }}
      />

      {/* Cookie preference center modal */}
      <CookiePreferenceCenter
        visible={showPreferenceCenter}
        currentConsent={granularConsent}
        onSave={(consent: GranularConsent) => {
          setGranularConsent(consent);
          setShowPreferenceCenter(false);
        }}
        onCancel={() => setShowPreferenceCenter(false)}
      />
    </>
  );
};

export default Index;
