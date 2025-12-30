/**
 * Cart Hook & Context
 *
 * Cart state management with localStorage persistence and backend reservation integration.
 * CartMint model: Each card is unique (1:1 scan), so cart stores product_uid references.
 * Items are reserved on the backend when added to cart (15-min TTL).
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

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

function loadOrCreateCartSessionId(): string {
  try {
    const stored = localStorage.getItem(CART_SESSION_ID_KEY);
    if (stored && stored.length > 0) {
      return stored;
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

  const validateCartReservations = useCallback(async (): Promise<boolean> => {
    if (items.length === 0) return true;

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
        return true;
      }

      const data = await response.json();
      if (!data.ok) {
        return true;
      }

      const validSet = new Set<string>(data.valid || []);
      const nextItems = items.filter((item) => validSet.has(item.product_uid));

      if (nextItems.length !== items.length) {
        setItems(nextItems);
        if (nextItems.length === 0) {
          clearCartActivity();
        }
      }

      return nextItems.length > 0;
    } catch {
      return true;
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
    void validateCartReservations();
  }, [items, expireCartIfIdle, validateCartReservations]);

  useEffect(() => {
    if (items.length === 0) return;

    const intervalId = window.setInterval(() => {
      expireCartIfIdle();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (expireCartIfIdle()) return;
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

  const checkout = useCallback(async () => {
    if (items.length === 0) return;
    if (expireCartIfIdle()) return;

    const stillValid = await validateCartReservations();
    if (!stillValid) {
      setCheckoutError("Your cart expired. Please add items again.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);
    recordCartActivity();

    try {
      // Cancel any stale checkout sessions from previous abandoned checkouts
      // This handles the case where user clicked browser back from Stripe
      const itemsWithSessions = items.filter((item) => item.checkout_session_id);
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
      const product_uids = items.map((item) => item.product_uid);

      const response = await fetch("/api/checkout/session/multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_uids,
          cart_session_id: cartSessionId,
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
        for (const item of items) {
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
  }, [items, setItemCheckoutSession, expireCartIfIdle, validateCartReservations, recordCartActivity]);

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
