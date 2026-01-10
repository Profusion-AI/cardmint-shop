import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, Trash2, Loader2, AlertCircle, Tag, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * TopBanner - Persistent site navigation header
 * Now connected to CartContext for real cart state
 */

interface TopBannerProps {
  /** Whether user is logged in - future auth integration */
  isLoggedIn?: boolean;
}

export function TopBanner({ isLoggedIn: _isLoggedIn = false }: TopBannerProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const {
    items,
    itemCount,
    subtotal,
    removeItem,
    isCheckingOut,
    checkoutError,
    checkout,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const subtotalCents = Math.round(subtotal * 100);
  const promoDiscountCents = appliedCoupon?.discount_cents ?? 0;
  const estimatedTotalCents = Math.max(0, subtotalCents - promoDiscountCents);

  // Show notification dot when cart has items
  const showNotificationDot = itemCount > 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(1, 21, 58, 0.95)' }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 transition-all duration-300 hover:opacity-90"
            aria-label="CardMint Home"
          >
            <img
              src={`${import.meta.env.BASE_URL}cardmint-horizontal.png`}
              alt="CardMint"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
              style={{
                filter: "drop-shadow(0 0 0 transparent)",
                transition: "filter 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(74, 220, 97, 0.3))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "drop-shadow(0 0 0 transparent)";
              }}
            />
          </Link>

          {/* Right: Navigation Links */}
          <nav className="flex items-center gap-6 md:gap-8">
            {/* Shop CardMint Vault Link */}
            <Link
              to="/vault"
              className="group relative font-sans text-sm font-medium text-paper/90 transition-colors duration-200 hover:text-mint"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:scale-110" />
                <span className="hidden sm:inline">Shop CardMint Vault</span>
                <span className="sm:hidden">Vault</span>
              </span>
              {/* Animated underline */}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-mint to-aqua transition-all duration-300 ease-out group-hover:w-full" />
            </Link>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="group relative flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-medium text-paper/90 transition-all duration-200 hover:bg-white/5 hover:text-mint"
            aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {/* Notification dot - only visible when logged in with items */}
                {showNotificationDot && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Cart Flyout Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="border-l border-white/10 bg-midnight/98 backdrop-blur-xl w-full sm:max-w-md"
        >
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="flex items-center gap-2 font-display text-xl text-paper">
              <ShoppingBag className="h-5 w-5 text-mint" />
              Your Cart
            </SheetTitle>
            <SheetDescription className="text-paper/60">
              {itemCount === 0
                ? "Your cart is currently empty"
                : `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`
              }
            </SheetDescription>
          </SheetHeader>

          {/* Cart Content */}
          <div className="flex flex-1 flex-col py-6">
            {itemCount === 0 ? (
              /* Empty Cart State */
              <div className="flex flex-col items-center justify-center gap-6 text-center px-4 py-12">
                {/* Empty bag illustration */}
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-mint/10 blur-2xl" />
                  <ShoppingBag className="relative h-16 w-16 text-paper/20" strokeWidth={1} />
                </div>

                <div className="space-y-2">
                  <p className="font-display text-lg text-paper">
                    Your Cart is Empty!
                  </p>
                  <p className="text-sm text-paper/50">
                    Discover rare vintage Pokémon cards in our curated vault.
                  </p>
                </div>

                {/* Shop Vault CTA */}
                <Link
                  to="/vault"
                  onClick={() => setCartOpen(false)}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-mint px-6 py-3 font-sans text-sm font-semibold text-midnight transition-all duration-300 hover:bg-aqua hover:shadow-lg hover:shadow-mint/20"
                >
                  <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Shop Vault</span>
                  {/* Shine effect on hover */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </Link>
              </div>
            ) : (
              /* Cart Items */
              <div className="w-full space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product_uid}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm"
                  >
                    <div className="h-16 w-12 overflow-hidden rounded-md border border-white/10 bg-midnight">
                      <img
                        src={item.frontImage || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-semibold text-paper">{item.name}</p>
                      <p className="truncate text-xs text-paper/60">
                        {item.set} {item.number ? `• #${item.number}` : ""}
                      </p>
                      <p className="text-xs text-paper/50">Condition: {item.condition}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-sm font-semibold text-paper">${item.price.toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-paper/70 hover:text-paper"
                        onClick={() => removeItem(item.product_uid)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer - Only show when items exist */}
          {itemCount > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-3">
              {/* Coupon Section */}
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 h-9 bg-white/5 border-white/20 text-paper placeholder:text-paper/40 focus:border-mint"
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-white/20 text-paper hover:bg-white/10 hover:text-mint"
                      onClick={() => {
                        applyCoupon(couponInput);
                        setCouponInput("");
                      }}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-400">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-mint/30 bg-mint/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-mint" />
                    <span className="text-sm font-medium text-mint">{appliedCoupon.code}</span>
                    <span className="text-xs text-paper/60">({appliedCoupon.discount_pct}% off)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-paper/60 hover:text-paper transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {checkoutError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-paper/70">Subtotal</span>
                  <span className="text-paper">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-mint">Promo Discount (est.)</span>
                    <span className="text-mint">-${(promoDiscountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1 border-t border-white/10">
                  <span className="text-paper/70">Estimated Total</span>
                  <span className="font-semibold text-paper">
                    ${(estimatedTotalCents / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-paper/50">
                  Shipping and bundle savings calculated at checkout
                </p>
              </div>

              <Button
                className="w-full rounded-lg bg-mint py-3 font-sans text-sm font-semibold text-midnight transition-colors hover:bg-aqua"
                onClick={checkout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
