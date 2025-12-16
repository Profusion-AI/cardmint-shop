import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      emoji="🍪"
      effectiveDate="November 11, 2025"
      breadcrumbLabel="Cookie Policy"
    >
      <p>
        At CardMint, we use cookies and similar technologies to make our site work
        properly, improve your experience, and ensure transparency in how we operate.
      </p>

      <h2>1. What We Collect</h2>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Keep your cart saved, maintain sign-in
          sessions, and process secure payments.
        </li>
        <li>
          <strong>Performance cookies:</strong> Help us understand how collectors
          browse (for example, which sets or cards get the most views).
        </li>
        <li>
          <strong>Preference cookies:</strong> Remember things like dark/light mode,
          region, and language settings.
        </li>
        <li>
          <strong>Marketing cookies:</strong> Used occasionally to show CardMint
          promotions — never to sell your data to third parties.
        </li>
      </ul>

      <h2>2. How to Control Cookies</h2>
      <p>
        You can manage or delete cookies anytime through your browser settings or by
        using our cookie preferences banner when you first visit. Essential cookies
        are, well, essential — turning them off may break features like checkout.
      </p>

      <h2>3. Why It Matters</h2>
      <p>
        We use cookies to keep CardMint fast, fair, and tailored to your collection
        habits — not to track you across the web. Your privacy is not a line item;
        it is part of our brand promise.
      </p>

      <div className="mt-12 pt-8 border-t border-paper/20">
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
