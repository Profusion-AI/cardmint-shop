import { Sparkles } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-oxford-blue border-t border-indigo-ink py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold">
                <span className="text-mint-spark">Card</span>
                <span className="text-cardmint-red">Mint</span>
              </span>
              <Sparkles className="w-5 h-5 text-mint-spark" />
            </div>
            <p className="text-muted-foreground text-sm">
              Premium vintage Pokémon cards, curated for collectors.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/wotc-era" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  WotC Era Collection
                </a>
              </li>
              <li>
                <a href="/new-arrivals" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/graded-cards" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Graded Cards
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/shipping" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="/grading-guide" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Grading Guide
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-indigo-ink text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} CardMint. All rights reserved. Cards are authentic, pricing is honest.</p>
        </div>
      </div>
    </footer>
  );
};
