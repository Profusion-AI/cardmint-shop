import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  Shield,
  RotateCcw,
  CheckCircle2,
  Mail,
  Globe,
  AlertCircle,
  Sparkles,
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

// Shipping rate card
function ShippingRateCard({
  method,
  price,
  delivery,
  description,
  recommended,
}: {
  method: string;
  price: string;
  delivery: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <div
      className={`relative p-5 rounded-lg border transition-all
        ${
          recommended
            ? "bg-mint/[0.08] border-mint/30 shadow-[0_0_20px_-5px_rgba(108,200,170,0.15)]"
            : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
        }`}
    >
      {recommended && (
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-mint text-ink text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-paper">{method}</h4>
          <p className="text-sm text-paper/50 mt-1">{description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold text-mint tabular-nums">{price}</div>
          <div className="text-xs text-paper/40 mt-0.5">{delivery}</div>
        </div>
      </div>
    </div>
  );
}

// Highlight callout box
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

// Step indicator for return process
function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
        <span className="text-sm font-bold text-mint">{number}</span>
      </div>
      <div className="flex-1 pb-6 border-l-2 border-white/[0.08] pl-6 -ml-[17px] last:border-transparent last:pb-0">
        <h4 className="font-medium text-paper">{title}</h4>
        <p className="text-sm text-paper/50 mt-1">{description}</p>
      </div>
    </div>
  );
}

// Packing item with checkmark
function PackingItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
      <span className="text-sm text-paper/70">{children}</span>
    </div>
  );
}

export default function ShippingReturns() {
  return (
    <LegalPageLayout
      title="Shipping & Returns"
      emoji="📦"
      effectiveDate="December 18, 2025"
      breadcrumbLabel="Shipping & Returns"
    >
      {/* Hero intro */}
      <p className="text-lg text-paper/70 leading-relaxed mb-8">
        Every card ships with tracking and premium protection. No surprises —
        just collectibles delivered safely to your door.
      </p>

      {/* Key guarantees banner */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        {[
          { icon: Shield, text: "Premium Protection" },
          { icon: Truck, text: "Always Tracked" },
          { icon: RotateCcw, text: "14-Day Returns" },
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SHIPPING SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-2">
        <Package className="w-6 h-6 text-mint" />
        Shipping
      </h2>

      {/* Shipping rates */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Truck}
          title="Shipping Options"
          subtitle="All shipments include tracking — we never ship untracked"
        />
        <div className="space-y-3">
          <ShippingRateCard
            method="Ground Advantage"
            price="$4.95"
            delivery="3-5 business days"
            description="USPS tracked shipping for standard orders"
            recommended
          />
          <ShippingRateCard
            method="Priority Mail"
            price="$9.95"
            delivery="2-3 business days"
            description="Faster USPS delivery with additional insurance"
          />
        </div>

        <div className="mt-5 pt-5 border-t border-white/[0.08]">
          <p className="text-sm text-paper/60 mb-3">
            <strong className="text-paper/80">Auto-upgrade to Priority:</strong>{" "}
            Orders with 20+ cards or $45+ subtotal automatically ship Priority
            for better protection.
          </p>
          <p className="text-xs text-paper/40">
            Orders over $100 receive additional handling review before shipping.
          </p>
        </div>
      </SectionCard>

      {/* Packing standards */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Sparkles}
          title="How We Pack Your Cards"
          subtitle="Every card receives the same careful treatment"
        />
        <div className="grid grid-cols-2 gap-3">
          <PackingItem>Protective penny sleeve</PackingItem>
          <PackingItem>Card Saver 2 or toploader</PackingItem>
          <PackingItem>Team bag with tape closure</PackingItem>
          <PackingItem>Rigid mailer or padded envelope</PackingItem>
        </div>
      </SectionCard>

      {/* Processing time */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Clock}
          title="Processing Time"
          subtitle="When your order ships"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-sm font-medium text-mint mb-1">Same Day</div>
            <p className="text-sm text-paper/60">
              Orders before 2 PM EST, Mon–Fri
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-sm font-medium text-paper/70 mb-1">
              Next Business Day
            </div>
            <p className="text-sm text-paper/60">
              Orders after 2 PM or on weekends
            </p>
          </div>
        </div>
      </SectionCard>

      {/* International notice */}
      <Callout icon={Globe} variant="info">
        <strong>US Only:</strong> We currently ship to the 50 states, DC, and
        APO/FPO addresses. International shipping is coming soon. Questions?{" "}
        <a
          href="mailto:support@cardmintshop.com"
          className="text-mint hover:underline font-medium"
        >
          Contact us
        </a>
        .
      </Callout>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RETURNS SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <h2 className="flex items-center gap-3 text-xl font-bold text-paper mb-6 mt-12">
        <RotateCcw className="w-6 h-6 text-mint" />
        Returns
      </h2>

      <p className="text-paper/70 mb-6">
        We stand behind every card we sell. Not satisfied? We're here to help.
      </p>

      {/* Return eligibility */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={CheckCircle2}
          title="Return Eligibility"
          subtitle="What qualifies for a return"
        />
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-mint/50 flex-shrink-0" />
            <div>
              <div className="font-medium text-paper text-sm">14-Day Window</div>
              <p className="text-sm text-paper/50 mt-0.5">
                Contact us within 14 days of delivery to request a return.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-mint/50 flex-shrink-0" />
            <div>
              <div className="font-medium text-paper text-sm">
                Original Condition
              </div>
              <p className="text-sm text-paper/50 mt-0.5">
                Cards must be returned in the same condition — same sleeve, no
                additional handling marks.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-emerald-500/50 flex-shrink-0" />
            <div>
              <div className="font-medium text-emerald-400 text-sm">
                Not As Described? We Cover It
              </div>
              <p className="text-sm text-paper/50 mt-0.5">
                If a card's condition differs from our listing, we pay return
                shipping and issue a full refund.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Return process */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={Mail}
          title="How to Return"
          subtitle="Simple 4-step process"
        />
        <div className="mt-2">
          <StepItem
            number={1}
            title="Email Us"
            description="Send your order number and reason to support@cardmintshop.com"
          />
          <StepItem
            number={2}
            title="Get Instructions"
            description="We'll respond within 24 hours with return details and a shipping label if applicable"
          />
          <StepItem
            number={3}
            title="Ship It Back"
            description="Pack the card securely — we recommend using our original packaging"
          />
          <StepItem
            number={4}
            title="Receive Refund"
            description="Once inspected, your refund processes within 3 business days"
          />
        </div>
      </SectionCard>

      {/* Refund info */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <SectionCard>
          <div className="text-sm font-medium text-paper mb-2">
            Refund Method
          </div>
          <p className="text-sm text-paper/50">
            Refunds go to your original payment method. Allow 5-10 business days
            for bank processing.
          </p>
        </SectionCard>
        <SectionCard>
          <div className="text-sm font-medium text-paper mb-2">
            Damaged or Lost?
          </div>
          <p className="text-sm text-paper/50">
            Contact us immediately. We'll file a carrier claim and replace or
            refund your order.
          </p>
        </SectionCard>
      </div>

      {/* Contact CTA */}
      <Callout icon={AlertCircle} variant="success">
        <strong>Questions?</strong> Email{" "}
        <a
          href="mailto:support@cardmintshop.com"
          className="text-mint hover:underline font-medium"
        >
          support@cardmintshop.com
        </a>{" "}
        — we typically respond within 24 hours.
      </Callout>

      {/* Footer links */}
      <p className="text-paper/40 text-sm mt-10 pt-6 border-t border-white/[0.06]">
        See also:{" "}
        <Link to="/legal/privacy" className="text-mint hover:underline">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link to="/legal/terms" className="text-mint hover:underline">
          Terms of Service
        </Link>
      </p>
    </LegalPageLayout>
  );
}
