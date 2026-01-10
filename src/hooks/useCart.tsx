/**
 * Cart Hook & Context
 *
 * Cart state management with localStorage persistence and backend reservation integration.
 * CartMint model: Each card is unique (1:1 scan), so cart stores product_uid references.
 * Items are reserved on the backend when added to cart (15-min TTL).
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { trackEvent } from "@/lib/posthogLoader";

// Cart item matches the product data structure
export interface CartItem {
  product_uid: string;
  name: string;
  set: string;
  number: string;
  condition: string;
  price: number;
  frontImage: string;
  slug: string;
  addedAt: number;
  /** Stripe checkout session ID - set when checkout starts, cleared on cancel/complete */
  checkout_session_id?: string;
}

/** Applied coupon discount info */
export interface AppliedCoupon {
  code: string;
  discount_pct: number;
  discount_cents: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  cartSessionId: string;
  addItem: (item: Omit<CartItem, "addedAt">) => Promise<void>;
  removeItem: (productUid: string) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Clear local cart state only - does NOT release backend reservations. Use after successful payment. */
  clearLocalCart: () => void;
  isInCart: (productUid: string) => boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  checkout: () => Promise<void>;
  /** Applied coupon (if any) */
  appliedCoupon: AppliedCoupon | null;
  /** Error message from coupon validation */
  couponError: string | null;
  /** Whether a coupon is being validated */
  isApplyingCoupon: boolean;
  /** Apply a coupon code */
  applyCoupon: (code: string) => Promise<void>;
  /** Remove the applied coupon */
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "cardmint_cart";
const CART_SESSION_ID_KEY = "cardmint_cart_session_id";
const CART_ACTIVITY_KEY = "cardmint_cart_last_activity";
const CART_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * Generate a UUID v4 for cart session identification.
 * Uses crypto.randomUUID() if available (modern browsers), otherwise falls back.
 */
function generateCartSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * UUID v4 validation regex - matches standard UUID format.
 * Used to validate stored cart session IDs to prevent "perma-broken cart"
 * from corrupted localStorage values.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

function loadOrCreateCartSessionId(): string {
  try {
    const stored = localStorage.getItem(CART_SESSION_ID_KEY);
    if (stored && isValidUUID(stored)) {
      return stored;
    }
    // Invalid or missing - clear corrupted value if present
    if (stored) {
      localStorage.removeItem(CART_SESSION_ID_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  const newId = generateCartSessionId();
  try {
    localStorage.setItem(CART_SESSION_ID_KEY, newId);
  } catch {
    // Ignore storage errors
  }
  return newId;
}

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item.product_uid &&
            item.name &&
            typeof item.price === "number" &&
            typeof item.addedAt === "number"
        );
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function loadCartActivityFromStorage(items: CartItem[]): number | null {
  try {
    const stored = localStorage.getItem(CART_ACTIVITY_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }

  if (items.length === 0) return null;
  return Math.max(...items.map((item) => item.addedAt));
}

function persistCartActivity(timestamp: number | null): void {
  try {
    if (timestamp) {
      localStorage.setItem(CART_ACTIVITY_KEY, String(timestamp));
    } else {
      localStorage.removeItem(CART_ACTIVITY_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState<number | null>(null);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Persistent cart session ID - generated once and stored in localStorage
  const [cartSessionId] = useState<string>(() => loadOrCreateCartSessionId());

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedItems = loadCartFromStorage();
    setItems(storedItems);
    setLastActivityAt(loadCartActivityFromStorage(storedItems));
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const itemCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const recordCartActivity = useCallback(() => {
    const now = Date.now();
    setLastActivityAt(now);
    persistCartActivity(now);
  }, []);

  const clearCartActivity = useCallback(() => {
    setLastActivityAt(null);
    persistCartActivity(null);
  }, []);

  /**
   * Add item to cart - reserves on backend first, then adds to local state.
   * Throws error if reservation fails (item unavailable, rate limited, etc.)
   */
  const addItem = useCallback(async (item: Omit<CartItem, "addedAt">) => {
    // Check for duplicate first (each card is unique)
    if (items.some((i) => i.product_uid === item.product_uid)) {
      return; // Already in cart - silently skip
    }

    // Reserve on backend
    const response = await fetch("/api/cart/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_uids: [item.product_uid],
        cart_session_id: cartSessionId,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      throw new Error("Failed to reserve item");
    }

    const data = await response.json();
    if (!data.ok || !data.reserved?.includes(item.product_uid)) {
      // Check for specific failure reason
      const failReason = data.failed?.find(
        (f: { product_uid: string; reason: string }) => f.product_uid === item.product_uid
      )?.reason;
      if (failReason === "UNAVAILABLE") {
        throw new Error("This item is no longer available");
      }
      if (failReason === "MAX_ITEMS_EXCEEDED") {
        throw new Error("Cart is full (max 10 items)");
      }
      throw new Error("Failed to reserve item");
    }

    // Add to local state only after backend confirms
    setItems((prev) => {
      // Double-check no duplicate (race condition safety)
      if (prev.some((i) => i.product_uid === item.product_uid)) {
        return prev;
      }
      return [...prev, { ...item, addedAt: Date.now() }];
    });
    recordCartActivity();
    setCheckoutError(null);

    // Track add to cart event
    trackEvent('add_to_cart', {
      product_id: item.product_uid,
      product_name: item.name,
      set_name: item.set,
      condition: item.condition,
      price: item.price,
      currency: 'USD',
    });
  }, [items, cartSessionId, recordCartActivity]);

  /**
   * Remove item from cart - releases backend reservation and removes from local state.
   */
  const removeItem = useCallback(async (productUid: string) => {
    // Find the item to check if it has an active checkout session
    const itemToRemove = items.find((i) => i.product_uid === productUid);
    if (!itemToRemove) return;

    // Remove from cart immediately for snappy UI
    setItems((prev) => prev.filter((i) => i.product_uid !== productUid));
    setCheckoutError(null);
    recordCartActivity();

    // Release from backend cart (fire-and-forget - item will auto-expire if this fails)
    fetch("/api/cart/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_uids: [productUid],
        cart_session_id: cartSessionId,
      }),
    }).catch((error) => {
      console.warn("Error releasing cart item:", error);
      // Item will auto-expire via TTL
    });

    // If item had checkout session, cancel it in background to release the Stripe reservation
    if (itemToRemove.checkout_session_id) {
      fetch(`/api/checkout/session/${itemToRemove.checkout_session_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => {
        console.warn("Error cancelling checkout session:", error);
        // Session will expire eventually via TTL
      });
    }
  }, [items, cartSessionId, recordCartActivity]);

  /**
   * Clear all items from cart - releases all backend reservations.
   */
  const clearCart = useCallback(async () => {
    // Capture items before clearing
    const productUids = items.map((i) => i.product_uid);
    const itemsWithSessions = items.filter((item) => item.checkout_session_id);

    // Clear cart immediately for snappy UI
    setItems([]);
    setCheckoutError(null);
    clearCartActivity();

    // Release all items from backend cart
    if (productUids.length > 0) {
      fetch("/api/cart/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_uids: productUids,
          cart_session_id: cartSessionId,
        }),
      }).catch((error) => {
        console.warn("Error releasing cart items:", error);
        // Items will auto-expire via TTL
      });
    }

    // Cancel all active checkout sessions in background
    itemsWithSessions.forEach((item) => {
      fetch(`/api/checkout/session/${item.checkout_session_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => {
        console.warn("Error cancelling checkout session:", error);
        // Session will expire eventually via TTL
      });
    });
  }, [items, cartSessionId, clearCartActivity]);

  /**
   * Clear local cart state only - does NOT release backend reservations.
   * Use this after successful payment to avoid accidentally releasing paid inventory.
   * The webhook will mark items as SOLD; we just need to clear local UI state.
   */
  const clearLocalCart = useCallback(() => {
    setItems([]);
    setCheckoutError(null);
    clearCartActivity();
    // Note: We intentionally do NOT call /api/cart/release or /api/checkout/session/cancel
    // The Stripe webhook will handle marking items as SOLD after payment
  }, [clearCartActivity]);

  /**
   * Validate cart reservations with the backend.
   * Returns the validated items array to avoid stale closure issues.
   * The caller should use the returned items for subsequent operations.
   */
  const validateCartReservations = useCallback(async (): Promise<{ valid: boolean; items: CartItem[] }> => {
    if (items.length === 0) return { valid: true, items: [] };

    try {
      const response = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_uids: items.map((item) => item.product_uid),
          cart_session_id: cartSessionId,
        }),
      });

      if (!response.ok) {
        return { valid: true, items };
      }

      const data = await response.json();
      if (!data.ok) {
        return { valid: true, items };
      }

      const validSet = new Set<string>(data.valid || []);
      const nextItems = items.filter((item) => validSet.has(item.product_uid));

      if (nextItems.length !== items.length) {
        setItems(nextItems);
        if (nextItems.length === 0) {
          clearCartActivity();
        }
      }

      return { valid: nextItems.length > 0, items: nextItems };
    } catch {
      return { valid: true, items };
    }
  }, [items, cartSessionId, clearCartActivity]);

  const expireCartIfIdle = useCallback((): boolean => {
    if (!lastActivityAt) return false;
    if (Date.now() - lastActivityAt <= CART_TIMEOUT_MS) return false;
    void clearCart();
    setCheckoutError("Your cart expired after 15 minutes of inactivity.");
    return true;
  }, [clearCart, lastActivityAt]);

  useEffect(() => {
    if (items.length === 0) return;
    if (expireCartIfIdle()) return;
    // Fire-and-forget validation - state updates happen inside
    void validateCartReservations();
  }, [items.length, expireCartIfIdle, validateCartReservations]);

  useEffect(() => {
    if (items.length === 0) return;

    const intervalId = window.setInterval(() => {
      expireCartIfIdle();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (expireCartIfIdle()) return;
      // Fire-and-forget validation - state updates happen inside
      void validateCartReservations();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [items.length, expireCartIfIdle, validateCartReservations]);

  const isInCart = useCallback(
    (productUid: string) => items.some((i) => i.product_uid === productUid),
    [items]
  );

  // Helper to update a cart item with checkout session ID
  const setItemCheckoutSession = useCallback((productUid: string, sessionId: string | undefined) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_uid === productUid
          ? { ...item, checkout_session_id: sessionId }
          : item
      )
    );
  }, []);

  /**
   * Apply a coupon code - validates against backend and stores result.
   * Coupon discount is calculated against current subtotal.
   */
  const applyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) return;
    if (items.length === 0) {
      setCouponError("Add items to cart first");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const subtotalCents = Math.round(subtotal * 100);
      const response = await fetch("/api/checkout/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon_code: code,
          subtotal_cents: subtotalCents,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const errorMessage = data.message || "Failed to validate coupon";
        setCouponError(errorMessage);
        setAppliedCoupon(null);
        trackEvent('coupon_failed', {
          code,
          reason: data.reason || 'unknown',
          subtotal_cents: subtotalCents,
        });
        return;
      }

      if (!data.valid) {
        setCouponError(data.message || "Invalid coupon");
        setAppliedCoupon(null);
        trackEvent('coupon_failed', {
          code,
          reason: data.reason || 'invalid',
          subtotal_cents: subtotalCents,
        });
        return;
      }

      // Coupon is valid - store it
      setAppliedCoupon({
        code: data.coupon.code,
        discount_pct: data.coupon.discount_pct,
        discount_cents: data.coupon.discount_cents,
      });
      setCouponError(null);

      trackEvent('coupon_applied', {
        code: data.coupon.code,
        discount_pct: data.coupon.discount_pct,
        discount_cents: data.coupon.discount_cents,
        subtotal_cents: subtotalCents,
      });
    } catch (error) {
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [items.length, subtotal]);

  /**
   * Remove the currently applied coupon.
   */
  const removeCoupon = useCallback(() => {
    if (appliedCoupon) {
      trackEvent('coupon_removed', {
        code: appliedCoupon.code,
      });
    }
    setAppliedCoupon(null);
    setCouponError(null);
  }, [appliedCoupon]);

  const checkout = useCallback(async () => {
    if (items.length === 0) return;
    if (expireCartIfIdle()) return;

    const validation = await validateCartReservations();
    if (!validation.valid) {
      setCheckoutError("Your cart expired. Please add items again.");
      return;
    }

    // Use the validated items from the return value to avoid stale closure
    const validatedItems = validation.items;
    if (validatedItems.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);
    recordCartActivity();

    // Track checkout started event
    trackEvent('checkout_started', {
      item_count: validatedItems.length,
      total_value: validatedItems.reduce((sum, item) => sum + item.price, 0),
      currency: 'USD',
      product_ids: validatedItems.map((item) => item.product_uid),
    });

    try {
      // Cancel any stale checkout sessions from previous abandoned checkouts
      // This handles the case where user clicked browser back from Stripe
      const itemsWithSessions = validatedItems.filter((item) => item.checkout_session_id);
      if (itemsWithSessions.length > 0) {
        // Get unique session IDs (all items in a multi-checkout share the same session)
        const sessionIds = [...new Set(itemsWithSessions.map((item) => item.checkout_session_id))];

        // Cancel all stale sessions to release reservations
        await Promise.all(
          sessionIds.map((sessionId) =>
            fetch(`/api/checkout/session/${sessionId}/cancel`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }).catch((error) => {
              console.warn("Error cancelling stale checkout session:", error);
              // Continue anyway - session may have expired or been cancelled already
            })
          )
        );

        // Clear session IDs from cart items before proceeding
        setItems((prev) =>
          prev.map((item) => ({ ...item, checkout_session_id: undefined }))
        );
      }

      // Multi-item checkout: send all product_uids to the Lot Builder endpoint
      // Backend calculates discount and creates Stripe session with all items
      const product_uids = validatedItems.map((item) => item.product_uid);

      const response = await fetch("/api/checkout/session/multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_uids,
          cart_session_id: cartSessionId,
          coupon_code: appliedCoupon?.code,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      if (data.checkout_url && data.session_id) {
        // Store session ID with ALL cart items (all are now RESERVED in backend)
        for (const item of validatedItems) {
          setItemCheckoutSession(item.product_uid, data.session_id);
        }
        // Redirect to Stripe
        window.location.href = data.checkout_url;
      } else if (data.checkout_url) {
        // Fallback: if no session_id returned, still redirect but log warning
        console.warn("Checkout response missing session_id - cart removal won't release reservation");
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  }, [items, setItemCheckoutSession, expireCartIfIdle, validateCartReservations, recordCartActivity, appliedCoupon, cartSessionId]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        cartSessionId,
        addItem,
        removeItem,
        clearCart,
        clearLocalCart,
        isInCart,
        isCheckingOut,
        checkoutError,
        checkout,
        appliedCoupon,
        couponError,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
