import { Link } from "react-router-dom";
import { XCircle, ShoppingBag, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CheckoutCancel - Displayed when user cancels Stripe checkout
 * Explains what happened and offers to return to shopping
 */
export default function CheckoutCancel() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Cancel Icon */}
        <div className="relative mx-auto w-20 h-20 mb-8">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/30">
            <XCircle className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-paper mb-4 font-display">
          Checkout Cancelled
        </h1>

        {/* Subtext */}
        <p className="text-paper/70 mb-8 leading-relaxed">
          No worries - your payment was not processed and no charges were made.
          Your items may still be available if you'd like to try again.
        </p>

        {/* Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-paper/60" />
            <span className="text-sm font-medium text-paper">What happened?</span>
          </div>
          <p className="text-sm text-paper/60">
            You cancelled the checkout process or the session expired.
            Your cart items were released and may be available for purchase again.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="mint" size="lg">
            <Link to="/vault" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Return to Vault
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-paper/50">
          Need help?{" "}
          <a href="mailto:support@cardmintshop.com" className="text-mint hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
