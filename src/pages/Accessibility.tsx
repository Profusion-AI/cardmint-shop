import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function Accessibility() {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      emoji="♿"
      effectiveDate="December 2025"
      breadcrumbLabel="Accessibility"
    >
      <h2>Our Commitment</h2>
      <p>
        CardMint is committed to ensuring digital accessibility for people with
        disabilities. We are continually improving the user experience for everyone
        and applying the relevant accessibility standards.
      </p>

      <h2>Conformance Status</h2>
      <p>
        We target conformance with the{" "}
        <a
          href="https://www.w3.org/TR/WCAG21/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mint hover:underline"
        >
          Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
        </a>
        . This is an ongoing effort as we expand and improve our platform.
      </p>

      <h2>Measures We Take</h2>
      <ul>
        <li>Keyboard-navigable interfaces for all interactive elements</li>
        <li>Semantic HTML structure with proper heading hierarchy</li>
        <li>Alt text on all product images derived from our catalog data</li>
        <li>Color contrast ratios meeting WCAG AA requirements</li>
        <li>Focus indicators visible on all interactive components</li>
        <li>Reduced motion support via prefers-reduced-motion media query</li>
      </ul>

      <h2>Known Limitations</h2>
      <p>
        Some third-party components (payment processing, analytics) may have
        accessibility limitations outside our direct control. We work with vendors
        who share our commitment to accessibility.
      </p>

      <h2>Feedback & Contact</h2>
      <p>
        We welcome your feedback on the accessibility of CardMint. If you encounter
        barriers or have suggestions, please contact us:
      </p>
      <ul>
        <li>
          Email:{" "}
          <a
            href="mailto:accessibility@cardmintshop.com"
            className="text-mint hover:underline"
          >
            accessibility@cardmintshop.com
          </a>
        </li>
      </ul>
      <p>
        We aim to respond to accessibility feedback within 5 business days and to
        implement remediation within 30 days for valid concerns.
      </p>

      <div className="mt-12 pt-8 border-t border-paper/20">
        <p className="text-paper/40 text-sm">
          CardMint is committed to ADA Title III compliance and continuous
          improvement of our digital accessibility.
        </p>
      </div>
    </LegalPageLayout>
  );
}
