import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-oxford-blue border-t border-indigo-ink py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
                <Link to="/vault" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  The Vault
                </Link>
              </li>
              <li>
                <Link to="/vault" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/grading-guide" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Grading Guide
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal/cookies" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/copyright" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Copyright & Attribution
                </Link>
              </li>
              <li>
                <Link to="/legal/ccpa" className="text-muted-foreground hover:text-mint-spark transition-colors">
                  Do Not Sell My Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-indigo-ink text-center text-sm text-muted-foreground space-y-2">
          <p>&copy; {currentYear} CardMint. All rights reserved. Cards are authentic, pricing is honest.</p>
          <p className="text-xs text-paper/40">
            Pokémon and related trademarks are property of The Pokémon Company International.
            CardMint is an independent marketplace and is not affiliated with, endorsed by,
            or sponsored by The Pokémon Company, Nintendo, or Game Freak.
          </p>
        </div>
      </div>
    </footer>
  );
};
