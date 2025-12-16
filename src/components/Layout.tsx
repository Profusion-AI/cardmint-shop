import { useEffect } from "react";
import { TopBanner } from "./TopBanner";

/**
 * Layout - Wraps all pages with persistent navigation
 *
 * State scaffolding notes:
 * - cartItemCount and isLoggedIn will be populated from global state
 *   when cart/auth contexts are implemented
 * - For now, both default to their empty/logged-out states
 */

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // TODO: Get cart state from CartContext when Stripe checkout is implemented
  // const { itemCount } = useCart();

  // TODO: Get auth state from AuthContext when user accounts are implemented
  // const { isLoggedIn } = useAuth();

  // Load Klaviyo tracking script
  useEffect(() => {
    if (!document.getElementById('klaviyo-script')) {
      const script = document.createElement('script');
      script.id = 'klaviyo-script';
      script.src = 'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=Utgrhu';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-oxford-blue">
      <TopBanner
        cartItemCount={0}  // TODO: Replace with itemCount from cart context
        isLoggedIn={false} // TODO: Replace with isLoggedIn from auth context
      />
      {children}
    </div>
  );
}
