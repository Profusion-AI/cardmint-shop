import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/posthogLoader";

type ClaimState =
  | "loading" // Checking for token in URL
  | "claiming" // Token found, completing claim
  | "success" // Claim completed
  | "expired" // Token expired
  | "invalid" // Token invalid or already used
  | "error" // Network/server error
  | "initiate" // No token - show order number input
  | "email-sent"; // Email link sent

interface ClaimResult {
  ok: boolean;
  orderNumber?: string;
  linked?: boolean;
  message?: string;
  error?: string;
}

/**
 * ClaimOrder - Handles order claim flow via email link
 *
 * Flow 1: User clicks email link with #token=...
 *   - Parse token from URL fragment (never sent to server in logs)
 *   - POST to /api/claim/complete with token
 *   - Show success/error
 *
 * Flow 2: User navigates directly to /claim (no token)
 *   - Show order number input form
 *   - POST to /api/claim/initiate with order number
 *   - Show "check your email" message
 */
export default function ClaimOrder() {
  const [state, setState] = useState<ClaimState>("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [inputOrderNumber, setInputOrderNumber] = useState("");
  const [claimedOrderNumber, setClaimedOrderNumber] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAttemptedRef = useRef(false);

  // Parse token from URL fragment on mount
  useEffect(() => {
    if (hasAttemptedRef.current) return;

    const hash = window.location.hash;
    if (hash && hash.includes("token=")) {
      // Extract token from #token=... format
      const tokenMatch = hash.match(/token=([^&]+)/);
      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        hasAttemptedRef.current = true;
        completeClaim(token);
        return;
      }
    }

    // No token found - show initiate form
    setState("initiate");
  }, []);

  // Complete claim with token
  const completeClaim = useCallback(async (token: string) => {
    setState("claiming");
    setError(null);

    try {
      const response = await fetch("/api/claim/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include session cookie if logged in
        body: JSON.stringify({ token }),
      });

      const data: ClaimResult = await response.json();

      if (response.ok && data.ok) {
        setClaimedOrderNumber(data.orderNumber || null);
        setIsLinked(data.linked || false);
        setState("success");

        trackEvent("claim_completed", {
          order_number: data.orderNumber,
          linked_to_account: data.linked,
        });
      } else if (response.status === 410) {
        // Token expired
        setState("expired");
        trackEvent("claim_failed", { reason: "expired" });
      } else {
        // Invalid token or already used
        setState("invalid");
        setError(data.message || "This claim link is no longer valid.");
        trackEvent("claim_failed", { reason: "invalid" });
      }
    } catch {
      setState("error");
      setError("Network error. Please try again.");
      trackEvent("claim_failed", { reason: "network_error" });
    }
  }, []);

  // Initiate claim (request email link)
  const initiateClaimHandler = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderNumber.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const normalizedOrder = inputOrderNumber.trim().toUpperCase();

    try {
      const response = await fetch("/api/claim/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: normalizedOrder }),
      });

      const data = await response.json();

      // API always returns 200 for valid CM-* orders (non-revealing)
      if (response.ok && data.ok) {
        setOrderNumber(normalizedOrder);
        setState("email-sent");
        trackEvent("claim_initiated", { order_prefix: normalizedOrder.slice(0, 3) });
      } else {
        // Only happens for malformed input or disabled feature
        setError(data.message || "Unable to process request. Please check the order number.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [inputOrderNumber]);

  // Retry with new order number
  const handleReset = () => {
    setState("initiate");
    setOrderNumber("");
    setInputOrderNumber("");
    setError(null);
    hasAttemptedRef.current = false;
    // Clear the hash without triggering navigation
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Loading State */}
        {state === "loading" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-mint animate-spin" />
            </div>
            <p className="text-paper/70">Checking claim link...</p>
          </>
        )}

        {/* Claiming State */}
        {state === "claiming" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-mint/10 border border-mint/20">
              <Loader2 className="w-8 h-8 text-mint animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-paper mb-3 font-display">
              Claiming Your Order
            </h1>
            <p className="text-paper/70">Please wait while we verify your claim...</p>
          </>
        )}

        {/* Success State */}
        {state === "success" && (
          <>
            <div className="relative mx-auto w-20 h-20 mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-mint/20" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-mint/20 border border-mint/30">
                <CheckCircle2 className="w-10 h-10 text-mint" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-paper mb-4 font-display">
              Order Claimed!
            </h1>

            <p className="text-paper/70 mb-8 leading-relaxed">
              {isLinked
                ? "Your order has been claimed and linked to your account."
                : "Your order has been claimed. Sign in to link it to your account for easy access."}
            </p>

            {claimedOrderNumber && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Package className="w-5 h-5 text-mint" />
                  <span className="text-sm font-medium text-paper">Order Number</span>
                </div>
                <p className="text-xl font-semibold text-mint font-mono">
                  {claimedOrderNumber}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="mint" size="lg">
                <Link to="/vault" className="flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* Expired State */}
        {state === "expired" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>

            <h1 className="text-2xl font-bold text-paper mb-3 font-display">
              Link Expired
            </h1>

            <p className="text-paper/70 mb-8">
              This claim link has expired. Claim links are valid for 30 minutes.
              Request a new link below.
            </p>

            <Button onClick={handleReset} variant="mint" size="lg">
              Request New Link
            </Button>
          </>
        )}

        {/* Invalid State */}
        {state === "invalid" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-paper mb-3 font-display">
              Invalid Link
            </h1>

            <p className="text-paper/70 mb-8">
              {error || "This claim link is no longer valid. It may have already been used."}
            </p>

            <Button onClick={handleReset} variant="mint" size="lg">
              Try Again
            </Button>
          </>
        )}

        {/* Error State */}
        {state === "error" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-paper mb-3 font-display">
              Something Went Wrong
            </h1>

            <p className="text-paper/70 mb-8">
              {error || "We couldn't process your claim. Please try again."}
            </p>

            <Button onClick={handleReset} variant="mint" size="lg">
              Try Again
            </Button>
          </>
        )}

        {/* Initiate Form State */}
        {state === "initiate" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-mint/10 border border-mint/20">
              <ShieldCheck className="w-8 h-8 text-mint" />
            </div>

            <h1 className="text-3xl font-bold text-paper mb-3 font-display">
              Claim Your Order
            </h1>

            <p className="text-paper/70 mb-8">
              Enter your order number below and we'll send a secure claim link
              to the email address associated with your order.
            </p>

            <form onSubmit={initiateClaimHandler} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="CM-20260113-000001"
                  value={inputOrderNumber}
                  onChange={(e) => setInputOrderNumber(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-paper placeholder:text-paper/40 text-center font-mono text-lg py-6"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="mint"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !inputOrderNumber.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Claim Link
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-paper/50">
              Don't have an order number?{" "}
              <a href="mailto:support@cardmintshop.com" className="text-mint hover:underline">
                Contact support
              </a>
            </p>
          </>
        )}

        {/* Email Sent State */}
        {state === "email-sent" && (
          <>
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-mint/10 border border-mint/20">
              <Mail className="w-8 h-8 text-mint" />
            </div>

            <h1 className="text-2xl font-bold text-paper mb-3 font-display">
              Check Your Email
            </h1>

            <p className="text-paper/70 mb-6">
              If order <span className="font-mono text-mint">{orderNumber}</span> exists,
              we've sent a claim link to the email address on file.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-paper mb-3 text-sm">What to do next:</h3>
              <ol className="space-y-2 text-sm text-paper/70">
                <li className="flex gap-2">
                  <span className="text-mint font-bold">1.</span>
                  Check your inbox (and spam folder)
                </li>
                <li className="flex gap-2">
                  <span className="text-mint font-bold">2.</span>
                  Click the secure link in the email
                </li>
                <li className="flex gap-2">
                  <span className="text-mint font-bold">3.</span>
                  Link expires in 30 minutes
                </li>
              </ol>
            </div>

            <Button onClick={handleReset} variant="outline" size="lg">
              Try Different Order
            </Button>

            <p className="mt-6 text-sm text-paper/50">
              Didn't receive an email?{" "}
              <a href="mailto:support@cardmintshop.com" className="text-mint hover:underline">
                Contact support
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
