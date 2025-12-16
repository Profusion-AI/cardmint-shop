import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      emoji="🔒"
      effectiveDate="November 11, 2025"
      breadcrumbLabel="Privacy Policy"
    >
      <p>
        We take your privacy seriously because collectors deserve transparency in
        more than just card conditions.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account info:</strong> Your name, email, and password (encrypted).
        </li>
        <li>
          <strong>Order details:</strong> Shipping address, card selections, and
          payment confirmation (handled securely via our payment provider; we never
          store full credit card numbers).
        </li>
        <li>
          <strong>Usage analytics:</strong> Non-identifiable data like device type,
          visit length, and pages viewed — used to improve site performance and design.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process orders, ship cards, and manage returns.</li>
        <li>To personalize your experience (e.g., saving your collection filters).</li>
        <li>
          To communicate order updates, restock alerts, and CardMint news (you can
          opt out anytime).
        </li>
        <li>To maintain site security and prevent fraud.</li>
      </ul>

      <h2>3. Sharing Information</h2>
      <p>
        We only share data with trusted partners essential to operations (shipping
        carriers, payment processors, and analytics tools).
      </p>
      <p>
        We do <strong>not</strong> sell or rent your personal data. Ever.
      </p>

      <h2>4. Your Rights</h2>
      <p>
        You can request to view, edit, or delete your data at any time by contacting{" "}
        <a
          href="mailto:privacy@cardmintshop.com"
          className="text-mint hover:underline"
        >
          privacy@cardmintshop.com
        </a>
        .
      </p>
      <p>
        If you're in the EU/UK, you also have rights under GDPR — including data
        portability and the right to lodge a complaint with your local authority.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain order and transaction data as required by law for accounting and
        anti-fraud purposes, then securely archive or delete it.
      </p>

      <h2>6. Security Measures</h2>
      <p>
        We encrypt data in transit (HTTPS/TLS) and at rest, and follow PCI-DSS and
        GDPR-aligned security practices.
      </p>

      <div className="mt-12 pt-8 border-t border-paper/20">
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
          <Link to="/legal/copyright" className="hover:text-mint transition-colors">
            Copyright & Attribution →
          </Link>
        </p>
      </div>
    </LegalPageLayout>
  );
}
