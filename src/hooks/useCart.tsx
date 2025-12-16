/**
 * Cart Hook & Context
 *
 * Simple cart state management with localStorage persistence.
 * CartMint model: Each card is unique (1:1 scan), so cart stores product_uid references.
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
  addItem: (item: Omit<CartItem, "addedAt">) => void;
  removeItem: (productUid: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productUid: string) => boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "cardmint_cart";

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => item.product_uid && item.name && typeof item.price === "number"
        );
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
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

  // Load cart from localStorage on mount
  useEffect(() => {
    setItems(loadCartFromStorage());
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const itemCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const addItem = useCallback((item: Omit<CartItem, "addedAt">) => {
    setItems((prev) => {
      // Don't add duplicates (each card is unique)
      if (prev.some((i) => i.product_uid === item.product_uid)) {
        return prev;
      }
      return [...prev, { ...item, addedAt: Date.now() }];
    });
    setCheckoutError(null);
  }, []);

  const removeItem = useCallback(async (productUid: string) => {
    // Find the item to check if it has an active checkout session
    const itemToRemove = items.find((i) => i.product_uid === productUid);

    // Remove from cart immediately for snappy UI
    setItems((prev) => prev.filter((i) => i.product_uid !== productUid));
    setCheckoutError(null);

    // If item had checkout session, cancel it in background to release the reservation
    if (itemToRemove?.checkout_session_id) {
      fetch(`/api/checkout/session/${itemToRemove.checkout_session_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => {
        console.warn("Error cancelling checkout session:", error);
        // Session will expire eventually via TTL
      });
    }
  }, [items]);

  const clearCart = useCallback(async () => {
    // Capture items with active sessions before clearing
    const itemsWithSessions = items.filter((item) => item.checkout_session_id);

    // Clear cart immediately for snappy UI
    setItems([]);
    setCheckoutError(null);

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
  }, [items]);

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

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // For now, checkout the first item (single-item checkout)
      // Multi-item checkout would require Stripe's multi-line-item session
      const item = items[0];

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_uid: item.product_uid,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/vault`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      if (data.checkout_url && data.session_id) {
        // Store session ID with cart item (item is now RESERVED in backend)
        setItemCheckoutSession(item.product_uid, data.session_id);
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
  }, [items, setItemCheckoutSession]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        clearCart,
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
