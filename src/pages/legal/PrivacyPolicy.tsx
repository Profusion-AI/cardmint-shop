import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Shield,
  User,
  ShoppingBag,
  BarChart3,
  Scale,
  Share2,
  Globe,
  Settings,
  UserCheck,
  Clock,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

// Accordion section component
function AccordionSection({
  number,
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  number: number;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 text-left
          bg-gradient-to-r from-white/[0.03] to-transparent
          hover:from-white/[0.05] transition-all group"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-mint/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-mint" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-paper tracking-tight">
            {number}. {title}
          </h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-paper/40 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 pt-2 border-t border-white/[0.06]">{children}</div>
      </div>
    </div>
  );
}

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

// Section header with icon (for use inside accordions)
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

// Info item with accent bar
function InfoItem({
  title,
  children,
  accent = "mint",
}: {
  title: string;
  children: React.ReactNode;
  accent?: "mint" | "amber" | "emerald";
}) {
  const accentColors = {
    mint: "bg-mint/50",
    amber: "bg-amber-500/50",
    emerald: "bg-emerald-500/50",
  };

  return (
    <div className="flex gap-3">
      <div className={`w-1 rounded-full ${accentColors[accent]} flex-shrink-0`} />
      <div>
        <div className="font-medium text-paper text-sm">{title}</div>
        <p className="text-sm text-paper/50 mt-0.5">{children}</p>
      </div>
    </div>
  );
}

// Third-party service card
function ServiceCard({
  name,
  purpose,
  location,
  details,
  links,
}: {
  name: string;
  purpose: string;
  location: string;
  details: string;
  links?: { label: string; url: string }[];
}) {
  return (
    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-paper">{name}</div>
          <div className="text-xs text-mint mt-0.5">{purpose}</div>
        </div>
        <span className="text-xs px-2 py-0.5 bg-white/10 text-paper/60 rounded">
          {location}
        </span>
      </div>
      <p className="text-sm text-paper/50 mt-3">{details}</p>
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-mint hover:underline"
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Retention item
function RetentionItem({ type, period }: { type: string; period: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-paper/70">{type}</span>
      <span className="text-sm font-medium text-mint">{period}</span>
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

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      emoji="🔒"
      effectiveDate="November 11, 2025"
      lastUpdated="December 17, 2025"
      breadcrumbLabel="Privacy Policy"
    >
      {/* Hero intro */}
      <p className="text-lg text-paper/70 leading-relaxed mb-8">
        We take your privacy seriously because collectors deserve transparency
        in more than just card conditions.
      </p>

      {/* Key points banner */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: Shield, text: "No Data Sales" },
          { icon: Lock, text: "Encrypted & Secure" },
          { icon: UserCheck, text: "Your Data, Your Control" },
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

      {/* Data Controller callout */}
      <Callout icon={User} variant="info">
        <strong>Data Controller:</strong> CardMint is operated by Kyle Finley
        ("CardMint", "we", "us", or "our"). For privacy inquiries, contact{" "}
        <a
          href="mailto:privacy@cardmintshop.com"
          className="text-mint hover:underline font-medium"
        >
          privacy@cardmintshop.com
        </a>
        .
      </Callout>

      {/* Section navigation hint */}
      <p className="text-paper/40 text-sm mt-8 mb-4">
        Click any section below to expand details:
      </p>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACCORDION SECTIONS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Section 1: Information We Collect */}
      <AccordionSection number={1} title="Information We Collect" icon={FileText}>
        <div className="space-y-4">
          <InfoItem title="Account Info">
            Your name, email, and password (encrypted).
          </InfoItem>
          <InfoItem title="Order Details">
            Shipping address, card selections, and payment confirmation (handled
            securely via our payment provider; we never store full credit card
            numbers).
          </InfoItem>
          <InfoItem title="Usage Analytics">
            Non-identifiable data like device type, visit length, and pages
            viewed — used to improve site performance and design.
          </InfoItem>
        </div>
      </AccordionSection>

      {/* Section 2: How We Use Your Information */}
      <AccordionSection
        number={2}
        title="How We Use Your Information"
        icon={ShoppingBag}
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[
            {
              icon: ShoppingBag,
              text: "Process orders, ship cards, and manage returns",
            },
            {
              icon: Settings,
              text: "Personalize your experience (e.g., saving filters)",
            },
            {
              icon: BarChart3,
              text: "Communicate order updates and restock alerts",
            },
            { icon: Shield, text: "Maintain site security and prevent fraud" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]"
            >
              <Icon className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
              <span className="text-sm text-paper/70">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-paper/40">
          You can opt out of marketing communications anytime.
        </p>
      </AccordionSection>

      {/* Section 3: Legal Basis for Processing */}
      <AccordionSection number={3} title="Legal Basis for Processing" icon={Scale}>
        <p className="text-sm text-paper/60 mb-5">
          We process your personal data under the following lawful bases:
        </p>
        <div className="space-y-4">
          <InfoItem title="Contract Performance" accent="mint">
            Processing orders, shipping, and customer service (necessary to
            fulfill our agreement with you).
          </InfoItem>
          <InfoItem title="Consent" accent="mint">
            Marketing emails and non-essential cookies (you can withdraw consent
            anytime).
          </InfoItem>
          <InfoItem title="Legitimate Interests" accent="mint">
            Site security, fraud prevention, and improving our services
            (balanced against your rights).
          </InfoItem>
          <InfoItem title="Legal Obligation" accent="mint">
            Tax records, fraud reporting, and compliance with applicable laws.
          </InfoItem>
        </div>
      </AccordionSection>

      {/* Section 4: Sharing Information */}
      <AccordionSection number={4} title="Sharing Information" icon={Share2}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-mint" />
              <span className="font-medium text-paper">We Share With</span>
            </div>
            <p className="text-sm text-paper/60">
              Trusted partners essential to operations: shipping carriers, payment
              processors, and analytics tools.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="font-medium text-paper">We Never Do</span>
            </div>
            <p className="text-sm text-paper/60">
              Sell or rent your personal data.{" "}
              <strong className="text-paper">Ever.</strong>
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Section 5: Third-Party Services */}
      <AccordionSection
        number={5}
        title="Third-Party Services & Transfers"
        icon={Globe}
      >
        <p className="text-paper/60 mb-5">
          We use the following third-party services that may process your data:
        </p>
        <div className="space-y-4">
          <ServiceCard
            name="Klaviyo"
            purpose="Email Marketing"
            location="United States"
            details="When you opt into marketing, Klaviyo processes your email and browsing activity. Tracking only loads after consent. Data transferred under Standard Contractual Clauses (SCCs)."
            links={[
              {
                label: "Data Processing",
                url: "https://www.klaviyo.com/legal/data-processing-addendum",
              },
              {
                label: "Privacy Notice",
                url: "https://www.klaviyo.com/legal/privacy/privacy-notice",
              },
            ]}
          />
          <ServiceCard
            name="Plausible Analytics"
            purpose="Website Analytics"
            location="European Union"
            details="Privacy-friendly analytics that does not use cookies or collect personal data. Provides aggregate statistics only. Data processed in the EU."
          />
          <ServiceCard
            name="Stripe"
            purpose="Payment Processing"
            location="United States"
            details="Handles all payment transactions securely. We never see or store your full card number. PCI DSS Level 1 certified. May set essential cookies for fraud prevention."
            links={[
              {
                label: "Privacy Center",
                url: "https://stripe.com/legal/privacy-center",
              },
            ]}
          />
          <ServiceCard
            name="DigitalOcean"
            purpose="Hosting"
            location="United States"
            details="Our servers are hosted in the US. DigitalOcean provides infrastructure security and is SOC 2 Type II certified."
          />
        </div>
      </AccordionSection>

      {/* Section 6: Your Privacy Choices */}
      <AccordionSection number={6} title="Your Privacy Choices" icon={Settings}>
        <div className="space-y-4">
          <InfoItem title="Cookie Preferences">
            Use the cookie banner when you first visit, or contact us to update
            your preferences.
          </InfoItem>
          <InfoItem title="Marketing Emails">
            Unsubscribe anytime via the link in any email, or contact us
            directly.
          </InfoItem>
          <InfoItem title="Data Access/Deletion">
            Contact us to request a copy of your data or to have it deleted. We
            respond within 30 days.
          </InfoItem>
          <InfoItem title="Global Privacy Control (GPC)" accent="emerald">
            We honor GPC browser signals as a valid opt-out of tracking and
            targeted advertising.
          </InfoItem>
        </div>
      </AccordionSection>

      {/* Section 7: Your Rights */}
      <AccordionSection number={7} title="Your Rights" icon={UserCheck}>
        <p className="text-paper/70 mb-5">
          You can request to view, edit, or delete your data at any time by
          contacting{" "}
          <a
            href="mailto:privacy@cardmintshop.com"
            className="text-mint hover:underline"
          >
            privacy@cardmintshop.com
          </a>
          .
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            <div className="text-sm font-medium text-paper mb-2">
              EU/UK Residents (GDPR)
            </div>
            <p className="text-sm text-paper/50">
              Rights to access, rectify, erase, restrict processing, data
              portability, and to object. You may lodge a complaint with your
              supervisory authority (e.g., ICO in UK, CNIL in France).
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            <div className="text-sm font-medium text-paper mb-2">
              California Residents (CCPA/CPRA)
            </div>
            <p className="text-sm text-paper/50">
              See Section 10 below for your specific rights under California law.
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Section 8: Data Retention */}
      <AccordionSection number={8} title="Data Retention" icon={Clock}>
        <p className="text-paper/60 mb-4">
          We retain your data for the following periods:
        </p>
        <div className="bg-white/[0.02] rounded-lg p-4">
          <RetentionItem type="Order & transaction data" period="7 years" />
          <RetentionItem
            type="Marketing consent records"
            period="Until withdrawn / 3yr inactive"
          />
          <RetentionItem
            type="Klaviyo tracking data"
            period="2 years after last activity"
          />
          <RetentionItem type="Email subscribers" period="Until unsubscribe" />
          <RetentionItem
            type="Support correspondence"
            period="2 years after last contact"
          />
          <RetentionItem
            type="Analytics (Plausible)"
            period="24 months (aggregate only)"
          />
        </div>
      </AccordionSection>

      {/* Section 9: Security Measures */}
      <AccordionSection number={9} title="Security Measures" icon={Lock}>
        <Callout icon={Lock} variant="success">
          We encrypt data in transit (HTTPS/TLS) and at rest, and follow PCI-DSS
          and GDPR-aligned security practices to keep your information safe.
        </Callout>
      </AccordionSection>

      {/* Section 10: California Privacy Rights */}
      <AccordionSection number={10} title="California Privacy Rights" icon={Scale}>
        <p className="text-paper/70 mb-5">
          If you are a California resident, you have specific rights under the
          CCPA and CPRA:
        </p>
        <div className="space-y-4 mb-6">
          <InfoItem title="Right to Know">
            Request details about personal information we've collected in the
            past 12 months, including categories, sources, purposes, and third
            parties.
          </InfoItem>
          <InfoItem title="Right to Delete">
            Request deletion of your personal information, subject to legal
            exceptions (e.g., completing transactions, legal obligations).
          </InfoItem>
          <InfoItem title="Right to Correct">
            Request correction of inaccurate personal information.
          </InfoItem>
          <InfoItem title="Right to Opt-Out of Sale/Sharing" accent="emerald">
            We do not sell for monetary consideration. However, some data
            sharing may constitute a "sale" under CCPA. Opt out via our{" "}
            <Link to="/legal/ccpa" className="text-mint hover:underline">
              Do Not Sell or Share
            </Link>{" "}
            page or by enabling GPC in your browser.
          </InfoItem>
          <InfoItem title="Right to Non-Discrimination">
            We will not discriminate against you for exercising your CCPA
            rights.
          </InfoItem>
        </div>
        <Callout icon={AlertCircle} variant="info">
          <strong>Exercise Your California Rights:</strong> Contact{" "}
          <a
            href="mailto:privacy@cardmintshop.com"
            className="text-mint hover:underline font-medium"
          >
            privacy@cardmintshop.com
          </a>
          . We will verify your identity and respond within 45 days.
        </Callout>
      </AccordionSection>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-white/[0.06]">
        <p className="text-paper/60 text-sm">
          Privacy questions?{" "}
          <a
            href="mailto:privacy@cardmintshop.com"
            className="text-mint hover:underline"
          >
            privacy@cardmintshop.com
          </a>
        </p>
        <p className="text-paper/40 text-sm mt-2">
          <Link to="/legal/cookies" className="hover:text-mint transition-colors">
            ← Cookie Policy
          </Link>
          {" · "}
          <Link
            to="/legal/copyright"
            className="hover:text-mint transition-colors"
          >
            Copyright & Attribution →
          </Link>
        </p>
      </div>
    </LegalPageLayout>
  );
}
