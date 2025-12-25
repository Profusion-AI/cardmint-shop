import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

interface OrderData {
  orderNumber: string;
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  createdAt: string;
}

// Exponential backoff delays for polling (0s, 1s, 2s, 3s, 4s, 5s)
const POLL_DELAYS = [0, 1000, 2000, 3000, 4000, 5000];
const MAX_ATTEMPTS = POLL_DELAYS.length;

/**
 * Custom hook for fetching order details with polling support.
 * Handles webhook race condition by polling until order is found or max attempts reached.
 */
function useOrderLookup(sessionId: string | null) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      const response = await fetch(`/api/orders/by-session/${sessionId}`);
      const data = await response.json();

      if (response.ok && data.ok && data.order) {
        setOrder(data.order);
        setIsPending(false);
        setError(null);
        return true;
      }

      if (response.status === 404 && data.pending) {
        setIsPending(true);
        return false;
      }

      setError(data.error || "Failed to fetch order");
      return false;
    } catch {
      setError("Network error");
      return false;
    }
  }, [sessionId]);

  const startPolling = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Wait before attempt (first attempt is immediate)
      if (POLL_DELAYS[attempt] > 0) {
        await new Promise((resolve) => setTimeout(resolve, POLL_DELAYS[attempt]));
      }

      const success = await fetchOrder();
      if (success) {
        setIsLoading(false);
        return;
      }
    }

    // All attempts exhausted
    setIsLoading(false);
    if (isPending) {
      setError("Order confirmation is taking longer than expected. Please check your email for confirmation.");
    }
  }, [sessionId, fetchOrder, isPending]);

  // Start polling on mount if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      startPolling();
    }
  }, [sessionId, startPolling]);

  const retry = useCallback(() => {
    setError(null);
    startPolling();
  }, [startPolling]);

  return { order, isLoading, isPending, error, retry };
}

/**
 * CheckoutSuccess - Displayed after successful Stripe checkout
 *
 * Fetches order number from backend API with polling for webhook race conditions.
 * Clears local cart state only (does NOT release backend reservations).
 */
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { clearLocalCart } = useCart();
  const sessionId = searchParams.get("session_id");

  const { order, isLoading, isPending, error, retry } = useOrderLookup(sessionId);

  // Clear local cart state on successful checkout
  useEffect(() => {
    if (sessionId) {
      clearLocalCart();
    }
  }, [sessionId, clearLocalCart]);

  // Format order number for display
  const displayOrderNumber = order?.orderNumber || null;
  const displayReference = displayOrderNumber || (sessionId ? `${sessionId.slice(0, 24)}...` : null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-mint/20" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-mint/20 border border-mint/30">
            <CheckCircle2 className="w-10 h-10 text-mint" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-paper mb-4 font-display">
          Thank You for Your Order!
        </h1>

        {/* Subtext */}
        <p className="text-paper/70 mb-8 leading-relaxed">
          Your payment was successful and your order is being prepared.
          Save your order number for reference.
        </p>

        {/* Order Info Card */}
        {sessionId && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-5 h-5 text-mint" />
              <span className="text-sm font-medium text-paper">Order Confirmed</span>
            </div>

            {/* Order Number Display */}
            {isLoading && !order ? (
              <div className="flex items-center justify-center gap-2 text-paper/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading order details...</span>
              </div>
            ) : displayOrderNumber ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-mint font-mono">
                  {displayOrderNumber}
                </p>
                {order?.itemCount && (
                  <p className="text-xs text-paper/50">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-paper/50 break-all font-mono">
                  Reference: {displayReference}
                </p>
                {isPending && !error && (
                  <p className="text-xs text-amber-400 flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Order confirmation pending...
                  </p>
                )}
              </div>
            )}

            {/* Error State with Retry */}
            {error && !isLoading && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-amber-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
                <button
                  onClick={retry}
                  className="text-xs text-mint hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* What's Next */}
        <div className="text-left bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-paper mb-4">What happens next?</h3>
          <ol className="space-y-3 text-sm text-paper/70">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint/20 text-mint text-xs font-bold flex items-center justify-center">1</span>
              <span>We'll carefully package your card(s) with premium protection</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint/20 text-mint text-xs font-bold flex items-center justify-center">2</span>
              <span>Your order ships with tracking (check back for updates)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint/20 text-mint text-xs font-bold flex items-center justify-center">3</span>
              <span>Your cards arrive safely, ready for your collection</span>
            </li>
          </ol>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="mint" size="lg">
            <Link to="/vault" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-paper/50">
          Questions?{" "}
          <a href="mailto:support@cardmintshop.com" className="text-mint hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
