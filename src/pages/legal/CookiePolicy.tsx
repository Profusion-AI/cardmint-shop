import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";
import {
  Cookie,
  Shield,
  BarChart3,
  Settings,
  Megaphone,
  Globe,
  Trash2,
  Info,
  CheckCircle2,
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

// Cookie type card
function CookieTypeCard({
  icon: Icon,
  name,
  description,
  required,
}: {
  icon: React.ElementType;
  name: string;
  description: string;
  required?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        required
          ? "bg-mint/[0.05] border-mint/20"
          : "bg-white/[0.02] border-white/[0.08]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            required ? "bg-mint/20" : "bg-white/10"
          }`}
        >
          <Icon className={`w-4 h-4 ${required ? "text-mint" : "text-paper/60"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-paper">{name}</span>
            {required && (
              <span className="text-xs px-1.5 py-0.5 bg-mint/20 text-mint rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-paper/50 mt-1">{description}</p>
        </div>
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

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      emoji="🍪"
      effectiveDate="November 11, 2025"
      breadcrumbLabel="Cookie Policy"
    >
      {/* Hero intro */}
      <p className="text-lg text-paper/70 leading-relaxed mb-8">
        We use cookies and similar technologies to make our site work properly,
        improve your experience, and ensure transparency in how we operate.
      </p>

      {/* Key points banner */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        {[
          { icon: Shield, text: "Privacy-First" },
          { icon: Settings, text: "Your Control" },
          { icon: CheckCircle2, text: "No Hidden Tracking" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center justify-center gap-2.5 py-3 px-4
              bg-white/[0.03] border border-white/[0.06] rounded-lg"
          >
            <Icon className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-paper/80">{text}</span>
          </div>
        ))}
      </div>

      {/* Cookie types */}
      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-2">
        <Cookie className="w-6 h-6 text-mint" />
        What We Collect
      </h2>

      <div className="space-y-4 mb-10">
        <CookieTypeCard
          icon={Shield}
          name="Essential Cookies"
          description="Keep your cart saved and process secure payments via Stripe. These are necessary for the site to function."
          required
        />
        <CookieTypeCard
          icon={BarChart3}
          name="Performance Cookies"
          description="Reserved for future privacy-friendly analytics. We do not currently use any analytics or performance tracking cookies."
        />
        <CookieTypeCard
          icon={Settings}
          name="Preference Cookies"
          description="Remember things like dark/light mode, region, and language settings for a personalized experience."
        />
        <CookieTypeCard
          icon={Megaphone}
          name="Marketing Cookies"
          description="Used for email marketing and personalization via Klaviyo. These only load when you explicitly consent to marketing cookies."
        />
      </div>

      {/* Third-party cookies */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Globe}
          title="Third-Party Cookies"
          subtitle="When you accept marketing cookies"
        />
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-3">
            <code className="text-mint text-sm font-mono bg-mint/10 px-2 py-1 rounded">
              __kla_id
            </code>
            <div className="flex-1">
              <p className="text-sm text-paper/70">
                A unique identifier used by Klaviyo to recognize returning visitors
                and personalize email communications. Collects page views,
                timestamps, and browser information. Expires after 2 years of
                inactivity.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-paper/70">
              <strong className="text-emerald-400">When you opt out:</strong> We
              immediately delete the __kla_id cookie and all associated localStorage
              data. We also set an opt-out flag (__kla_off) to prevent future
              tracking.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* How to control */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Settings}
          title="How to Control Cookies"
          subtitle="You're always in control"
        />
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-mint/50 flex-shrink-0" />
            <p className="text-sm text-paper/70">
              Use our <strong className="text-paper">cookie preferences banner</strong> when
              you first visit to make your choice.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-mint/50 flex-shrink-0" />
            <p className="text-sm text-paper/70">
              Manage or delete cookies anytime through your{" "}
              <strong className="text-paper">browser settings</strong>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-amber-500/50 flex-shrink-0" />
            <p className="text-sm text-paper/70">
              <strong className="text-amber-400">Note:</strong> Essential cookies
              are required — turning them off may break features like checkout.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Why it matters */}
      <Callout icon={Info} variant="info">
        <strong>Why It Matters:</strong> We use cookies to keep CardMint fast
        and to remember your cart — not for cross-site tracking or ad targeting.
        Your privacy is not a line item; it's part of our brand promise.
      </Callout>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-white/[0.06]">
        <p className="text-paper/60 text-sm">
          Questions about cookies?{" "}
          <a
            href="mailto:privacy@cardmintshop.com"
            className="text-mint hover:underline"
          >
            privacy@cardmintshop.com
          </a>
        </p>
        <p className="text-paper/40 text-sm mt-2">
          <Link to="/legal/privacy" className="hover:text-mint transition-colors">
            View our full Privacy Policy →
          </Link>
        </p>
      </div>
    </LegalPageLayout>
  );
}
