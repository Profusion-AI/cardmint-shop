import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";

export default function Copyright() {
  return (
    <LegalPageLayout
      title="Copyright & Attribution"
      emoji="©️"
      effectiveDate="November 11, 2025"
      breadcrumbLabel="Copyright & Attribution"
    >
      <h2>Brand Ownership</h2>
      <p className="mb-4">
        All content, logos, designs, card photography, and original descriptions
        on CardMintShop.com are © CardMint LLC 2025.
      </p>
      <p className="mb-8">
        The CardMint name and logo are trademarks of CardMint LLC. All rights
        reserved.
      </p>

      <h2>Third-Party IP</h2>
      <p className="mb-4">
        Pokémon™, card images, and related trademarks are property of{" "}
        <em>The Pokémon Company International</em> and are used under fair-use
        guidelines for identification and cataloging purposes.
      </p>
      <p className="mb-8">
        CardMint is an independent collector marketplace and is{" "}
        <strong>not affiliated with, endorsed by, or sponsored by</strong> The
        Pokémon Company, Nintendo, or Game Freak.
      </p>

      <h2>Use of Site Content</h2>
      <p className="mb-4">
        You may not reproduce or distribute CardMint materials without prior
        written consent, except for personal, non-commercial use (e.g., sharing
        listings or collection screenshots).
      </p>
      <p className="mb-4">
        If you quote or feature CardMint images or data, credit us as:
      </p>
      <blockquote className="mb-8 pl-4 border-l-2 border-mint/40 text-paper/70 italic">
        "Image courtesy of CardMintShop.com."
      </blockquote>

      <h2>Reporting Violations</h2>
      <p className="mb-4">
        If you believe content on CardMint infringes your copyright, please
        email{" "}
        <a
          href="mailto:legal@cardmintshop.com"
          className="text-mint hover:underline"
        >
          legal@cardmintshop.com
        </a>{" "}
        with details and supporting evidence.
      </p>
      <p className="mb-8">We respond promptly and respectfully.</p>

      <div className="mt-12 pt-8 border-t border-paper/20">
        <p className="text-paper/60 text-sm">
          Legal inquiries?{" "}
          <a
            href="mailto:legal@cardmintshop.com"
            className="text-mint hover:underline"
          >
            legal@cardmintshop.com
          </a>
        </p>
        <p className="text-paper/40 text-sm mt-2">
          <Link to="/legal/privacy" className="hover:text-mint transition-colors">
            ← Privacy Policy
          </Link>
        </p>
      </div>
    </LegalPageLayout>
  );
}
