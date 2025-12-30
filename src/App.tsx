import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/hooks/useCart";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Vault from "./pages/Vault";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

// Legal pages (lazy loaded for code splitting)
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const Copyright = lazy(() => import("./pages/legal/Copyright"));
const CCPAOptOut = lazy(() => import("./pages/legal/CCPAOptOut"));
const ShippingReturns = lazy(() => import("./pages/legal/ShippingReturns"));
const Accessibility = lazy(() => import("./pages/Accessibility"));

// Checkout flow pages (lazy loaded)
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));

const queryClient = new QueryClient();

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
    <div className="text-paper/60 animate-pulse">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/products/:slug" element={<ProductDetail />} />

                {/* Legal routes */}
                <Route path="/legal/cookies" element={<CookiePolicy />} />
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/legal/copyright" element={<Copyright />} />
                <Route path="/legal/ccpa" element={<CCPAOptOut />} />
                <Route path="/legal/shipping" element={<ShippingReturns />} />
                <Route path="/shipping" element={<ShippingReturns />} />
                <Route path="/accessibility" element={<Accessibility />} />

                {/* Legacy redirects for old footer links */}
                <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
                <Route path="/terms" element={<Navigate to="/legal/copyright" replace />} />

                {/* Checkout flow routes */}
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/cancel" element={<CheckoutCancel />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
