import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Globe,
  CheckCircle2,
  XCircle,
  Trash2,
  Ban,
  Cookie,
  UserCheck,
  AlertCircle,
} from "lucide-react";

// Reusable card wrapper for sections
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01]
        border border-white/[0.08] rounded-xl p-6
        backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

// Section header with icon
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-mint/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-mint" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-paper tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-paper/50 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Info item with icon
function ActionItem({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
      <Icon className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
      <span className="text-sm text-paper/70">{children}</span>
    </div>
  );
}

// Rights item with accent bar
function RightItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-1 rounded-full bg-mint/50 flex-shrink-0" />
      <div>
        <div className="font-medium text-paper text-sm">{title}</div>
        <p className="text-sm text-paper/50 mt-0.5">{children}</p>
      </div>
    </div>
  );
}

// Callout box
function Callout({
  icon: Icon,
  children,
  variant = "info",
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning";
}) {
  const styles = {
    info: "bg-mint/10 border-mint/20 text-mint",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${styles[variant]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed text-paper/80">{children}</div>
    </div>
  );
}

export default function CCPAOptOut() {
  const { hasConsented, granularConsent, setConsent } = useCookieConsent();

  const handleOptOut = () => {
    setConsent("necessary");
  };

  const isOptedOut = hasConsented && !granularConsent?.marketing;

  return (
    <LegalPageLayout
      title="Do Not Sell or Share My Personal Information"
      emoji="🛡️"
      effectiveDate="December 17, 2025"
      breadcrumbLabel="CCPA Opt-Out"
    >
      {/* Hero intro */}
      <p className="text-lg text-paper/70 leading-relaxed mb-8">
        This page allows California residents to opt out of the "sale" or
        "sharing" of personal information as defined under the California
        Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
      </p>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WHAT THIS MEANS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-2">
        <Shield className="w-6 h-6 text-mint" />
        What This Means
      </h2>

      <SectionCard className="mb-6">
        <p className="text-paper/70 mb-5">
          CardMint does not sell your personal information for monetary
          consideration. However, under California law, sharing data with
          third-party advertising or analytics services may be considered a
          "sale" or "share" of personal information.
        </p>

        <p className="text-sm text-paper/60 mb-4">
          When you opt out below, we will:
        </p>

        <div className="space-y-3">
          <ActionItem icon={Cookie}>
            Disable marketing and tracking cookies (including Klaviyo)
          </ActionItem>
          <ActionItem icon={Trash2}>
            Delete any existing tracking data stored in your browser
          </ActionItem>
          <ActionItem icon={Ban}>
            Set an opt-out preference that we will honor for future visits
          </ActionItem>
        </div>
      </SectionCard>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* YOUR CURRENT STATUS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-10">
        <UserCheck className="w-6 h-6 text-mint" />
        Your Current Status
      </h2>

      {/* Status card */}
      <SectionCard className="mb-6">
        {isOptedOut ? (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-400 text-lg">
                You have opted out of sale/sharing
              </h3>
              <p className="text-sm text-paper/60 mt-2 leading-relaxed">
                Marketing cookies are disabled. We are not sharing your data for
                targeted advertising. Your preference will be honored on all
                future visits.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400/80">
                  Your privacy is protected
                </span>
              </div>
            </div>
          </div>
        ) : hasConsented ? (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-400 text-lg">
                Marketing cookies are enabled
              </h3>
              <p className="text-sm text-paper/60 mt-2 leading-relaxed">
                You've accepted marketing cookies, which means some browsing
                data may be shared with third-party services like Klaviyo for
                personalization.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <XCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400/80">
                  Click below to opt out
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldQuestion className="w-6 h-6 text-paper/60" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-paper/80 text-lg">
                No consent preference recorded
              </h3>
              <p className="text-sm text-paper/60 mt-2 leading-relaxed">
                You haven't made a cookie choice yet. Click below to opt out of
                sale/sharing and set your privacy preference.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Opt-out button */}
      {!isOptedOut && (
        <button
          onClick={handleOptOut}
          className="w-full sm:w-auto px-8 py-4 bg-mint text-ink font-semibold rounded-xl
            hover:bg-mint/90 transition-all shadow-[0_0_30px_-5px_rgba(108,200,170,0.3)]
            hover:shadow-[0_0_40px_-5px_rgba(108,200,170,0.4)]
            flex items-center justify-center gap-3"
        >
          <Shield className="w-5 h-5" />
          Opt Out of Sale/Sharing
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* GLOBAL PRIVACY CONTROL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-10">
        <Globe className="w-6 h-6 text-mint" />
        Global Privacy Control (GPC)
      </h2>

      <SectionCard className="mb-6">
        <SectionHeader
          icon={Globe}
          title="Automatic Opt-Out via Browser"
          subtitle="We honor GPC signals"
        />
        <p className="text-paper/70 mb-4">
          We honor the{" "}
          <a
            href="https://globalprivacycontrol.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mint hover:underline font-medium"
          >
            Global Privacy Control (GPC)
          </a>{" "}
          browser signal. If you have GPC enabled, we automatically treat this
          as an opt-out request and disable marketing cookies without requiring
          action on this page.
        </p>

        <div className="mt-5 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <p className="text-sm text-paper/60 mb-3">
            <strong className="text-paper">GPC is supported by:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {["Firefox", "Brave", "DuckDuckGo", "Privacy Badger"].map(
              (browser) => (
                <span
                  key={browser}
                  className="text-xs px-3 py-1.5 bg-mint/10 text-mint rounded-full"
                >
                  {browser}
                </span>
              )
            )}
          </div>
        </div>
      </SectionCard>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* OTHER CALIFORNIA RIGHTS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-10">
        <CheckCircle2 className="w-6 h-6 text-mint" />
        Other California Rights
      </h2>

      <p className="text-paper/70 mb-6">
        California residents also have the right to:
      </p>

      <SectionCard className="mb-6">
        <div className="space-y-4">
          <RightItem title="Right to Know">
            Know what personal information we collect and how we use it
          </RightItem>
          <RightItem title="Right to Delete">
            Request deletion of personal information
          </RightItem>
          <RightItem title="Right to Correct">
            Request correction of inaccurate information
          </RightItem>
          <RightItem title="Right to Non-Discrimination">
            Not be discriminated against for exercising privacy rights
          </RightItem>
        </div>
      </SectionCard>

      <Callout icon={AlertCircle} variant="info">
        <strong>Exercise Your Rights:</strong> Contact{" "}
        <a
          href="mailto:privacy@cardmintshop.com"
          className="text-mint hover:underline font-medium"
        >
          privacy@cardmintshop.com
        </a>{" "}
        to exercise these rights. We will verify your identity and respond
        within 45 days.
      </Callout>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-white/[0.06]">
        <p className="text-paper/60 text-sm">
          Questions about your California privacy rights?{" "}
          <a
            href="mailto:privacy@cardmintshop.com"
            className="text-mint hover:underline"
          >
            privacy@cardmintshop.com
          </a>
        </p>
        <p className="text-paper/40 text-sm mt-2">
          <Link to="/legal/privacy" className="hover:text-mint transition-colors">
            ← Privacy Policy
          </Link>
          {" · "}
          <Link to="/legal/cookies" className="hover:text-mint transition-colors">
            Cookie Policy →
          </Link>
        </p>
      </div>
    </LegalPageLayout>
  );
}
