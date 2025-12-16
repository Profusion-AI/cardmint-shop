import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  RotateCcw,
  ShieldCheck,
  Truck,
  BadgeCheck,
  ArrowLeft,
  ZoomIn,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { parseProductSlug } from "@/utils/slugify";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

/**
 * Product type matching backend products table schema.
 */
interface Product {
  product_uid: string;
  product_sku: string;
  listing_sku: string;
  card_name: string;
  set_name: string;
  collector_no: string | null;
  condition_bucket: string;
  market_price: number | null;
  launch_price: number | null;
  total_quantity: number;
  /** Count of items actually available for checkout (excludes RESERVED) */
  available_quantity: number;
  staging_ready: number;
  cdn_image_url: string | null;
  cdn_back_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Condition display mapping with descriptions
const CONDITION_INFO: Record<string, { name: string; abbr: string; description: string }> = {
  NM: {
    name: "Near Mint",
    abbr: "NM",
    description: "Minimal wear visible. Sharp corners, clean surfaces, no creases."
  },
  LP: {
    name: "Lightly Played",
    abbr: "LP",
    description: "Minor edge wear or light scratching. May have slight whitening on back corners."
  },
  MP: {
    name: "Moderately Played",
    abbr: "MP",
    description: "Noticeable wear including edge whitening, surface scratches, or minor creasing."
  },
  HP: {
    name: "Heavily Played",
    abbr: "HP",
    description: "Significant wear. May include creases, heavy whitening, or surface damage."
  },
  SEALED: {
    name: "Sealed",
    abbr: "SEALED",
    description: "Factory sealed product. Never opened."
  },
  UNKNOWN: {
    name: "Condition TBD",
    abbr: "?",
    description: "Condition assessment pending."
  },
};

/**
 * Fetches product data by slug from backend API.
 * In dev, proxies through Vite dev server to http://127.0.0.1:4000
 */
async function fetchProductBySlug(slug: string): Promise<Product> {
  const response = await fetch(`/api/products/${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * ProductDetail page component.
 *
 * Premium PDP with:
 * - Front/back image toggle with zoom
 * - Trust badges and condition details
 * - Sticky buy box pattern
 * - CardMint brand styling
 */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [showBack, setShowBack] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });
  const { addItem, isInCart } = useCart();

  // Parse slug for debugging/analytics
  const slugParts = slug ? parseProductSlug(slug) : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-mint animate-spin mx-auto" />
          <p className="mt-4 text-paper/60">Loading card details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cardmint-red/10 mb-4">
            <AlertCircle className="h-8 w-8 text-cardmint-red" />
          </div>
          <h1 className="font-display text-2xl text-paper mb-2">Card Not Found</h1>
          <p className="text-paper/60 mb-6">
            {error instanceof Error ? error.message : "We couldn't find this card in our vault."}
          </p>
          <Link to="/vault">
            <Button className="bg-mint hover:bg-mint/90 text-midnight font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vault
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // No product state
  if (!product) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
        <p className="text-paper/60">No product data available</p>
      </div>
    );
  }

  // Computed values
  // Use available_quantity for checkout-related checks (excludes RESERVED items)
  const availableStock = product.available_quantity ?? product.total_quantity;
  const canonicalUrl = `${window.location.origin}/products/${slug}`;
  const availability = availableStock > 0 ? "in_stock" : "out_of_stock";
  const itemCondition = product.condition_bucket === "SEALED" ? "NewCondition" : "UsedCondition";
  const price = product.launch_price ?? product.market_price ?? 0;
  const marketPrice = product.market_price ?? 0;
  const isBelowMarket = price < marketPrice && marketPrice > 0;
  const isLowStock = availableStock > 0 && availableStock <= 2;
  const conditionInfo = CONDITION_INFO[product.condition_bucket] ?? CONDITION_INFO.UNKNOWN;
  const inCart = isInCart(product.product_uid);

  // Images
  const frontImage = product.cdn_image_url || "/placeholder.svg";
  const backImage = product.cdn_back_image_url;
  const hasBackImage = !!backImage;
  const currentImage = showBack && hasBackImage ? backImage : frontImage;

  const handleAddToCart = () => {
    addItem({
      product_uid: product.product_uid,
      name: product.card_name,
      set: product.set_name,
      number: product.collector_no ?? "",
      condition: conditionInfo.name,
      price,
      frontImage,
      slug: slug ?? product.product_uid,
    });
  };

  return (
    <>
      {/* Schema.org Product JSON-LD for SEO */}
      <ProductJsonLd
        name={product.card_name}
        sku={product.product_sku}
        url={canonicalUrl}
        image={frontImage}
        description={`${product.card_name} from ${product.set_name}${product.collector_no ? ` #${product.collector_no}` : ''} - ${conditionInfo.name} condition`}
        brandName="CardMint"
        price={price}
        currency="USD"
        availability={availability}
        itemCondition={itemCondition}
      />

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={currentImage}
              alt={`${product.card_name} - ${showBack ? 'Back' : 'Front'}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {hasBackImage && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowBack(!showBack); }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {showBack ? 'View Front' : 'View Back'}
                </button>
              )}
              <button
                onClick={() => setIsZoomed(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-oxford-blue">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm text-paper/50">
            <li>
              <Link to="/" className="hover:text-mint transition-colors">Home</Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li>
              <Link to="/vault" className="hover:text-mint transition-colors">Vault</Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-paper/80 truncate max-w-[200px]">{product.card_name}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div
                className="relative aspect-[3/4] bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 cursor-zoom-in group"
                onClick={() => setIsZoomed(true)}
              >
                <img
                  src={currentImage}
                  alt={`${product.card_name} - ${showBack ? 'Back' : 'Front'}`}
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Scanned Badge */}
                <div className="absolute top-4 right-4 bg-gold/90 text-midnight text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Eye className="h-3.5 w-3.5" />
                  SCANNED
                </div>

                {/* Low Stock Badge */}
                {isLowStock && (
                  <div className="absolute top-4 left-4 bg-cardmint-red/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {availableStock === 1 ? 'LAST ONE' : `ONLY ${availableStock}`}
                  </div>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5" />
                  Click to zoom
                </div>
              </div>

              {/* Image Toggle Buttons */}
              {hasBackImage && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBack(false)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      !showBack
                        ? 'bg-mint text-midnight shadow-lg shadow-mint/25'
                        : 'bg-white/5 text-paper/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Front
                  </button>
                  <button
                    onClick={() => setShowBack(true)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      showBack
                        ? 'bg-mint text-midnight shadow-lg shadow-mint/25'
                        : 'bg-white/5 text-paper/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Back
                  </button>
                </div>
              )}

              {/* Trust Badges Row */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Eye className="w-5 h-5 text-gold" />
                  <span className="text-sm text-paper/80">Scanned, not stock</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <BadgeCheck className="w-5 h-5 text-mint" />
                  <span className="text-sm text-paper/80">Collector-verified</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-aqua" />
                  <span className="text-sm text-paper/80">30-day guarantee</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Truck className="w-5 h-5 text-sage" />
                  <span className="text-sm text-paper/80">Fast, tracked ship</span>
                </div>
              </div>
            </div>

            {/* Right: Product Info (Sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">

              {/* Card Name & Set */}
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-paper leading-tight">
                  {product.card_name}
                </h1>
                <p className="mt-2 text-lg text-paper/60">
                  {product.set_name}
                  {product.collector_no && (
                    <span className="ml-2 text-gold">#{product.collector_no}</span>
                  )}
                </p>
              </div>

              {/* Condition Badge */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-paper/50 uppercase tracking-wide">Condition</span>
                  <Badge variant="outline" className="border-white/30 text-paper font-semibold px-3">
                    {conditionInfo.abbr}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-paper">{conditionInfo.name}</p>
                  <p className="text-sm text-paper/60 mt-1">{conditionInfo.description}</p>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl text-paper">${price.toFixed(2)}</span>
                  {isBelowMarket && (
                    <span className="text-aqua text-sm line-through opacity-70">
                      ${marketPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-3">
                  {availableStock > 0 ? (
                    <p className={`text-sm flex items-center gap-1.5 ${isLowStock ? 'text-gold' : 'text-aqua'}`}>
                      {isLowStock && <AlertCircle className="w-4 h-4" />}
                      In stock ({availableStock} available)
                    </p>
                  ) : (
                    <p className="text-sm text-cardmint-red">Out of stock</p>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  disabled={availableStock === 0 || inCart}
                  className="w-full mt-6 h-14 text-lg font-semibold bg-mint hover:bg-mint/90 text-midnight rounded-xl shadow-lg shadow-mint/25 disabled:bg-white/10 disabled:text-paper/30 disabled:shadow-none transition-all duration-200"
                  onClick={handleAddToCart}
                >
                  {availableStock === 0
                    ? 'Out of Stock'
                    : inCart
                      ? 'In Cart'
                      : 'Add to Cart'}
                </Button>
                {inCart && (
                  <p className="mt-2 text-xs text-aqua text-center">
                    This card is already in your cart. Checkout from the top right.
                  </p>
                )}

                {/* Shipping Note */}
                <p className="mt-4 text-xs text-paper/50 text-center">
                  Free shipping on orders over $50 • Tracked delivery
                </p>
              </div>

              {/* Product Details Accordion */}
              <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-paper/50 uppercase tracking-wide mb-3">
                    Product Details
                  </h3>
                  <dl className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <dt className="text-paper/60">Set</dt>
                      <dd className="text-paper font-medium">{product.set_name}</dd>
                    </div>
                    {product.collector_no && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-paper/60">Card Number</dt>
                        <dd className="text-paper font-medium">#{product.collector_no}</dd>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <dt className="text-paper/60">Condition</dt>
                      <dd className="text-paper font-medium">{conditionInfo.name}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-paper/60">SKU</dt>
                      <dd className="text-paper/70 font-mono text-xs">{product.product_sku}</dd>
                    </div>
                  </dl>
                </div>

                {/* Authenticity Note */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-paper">Authenticity Guaranteed</p>
                      <p className="text-xs text-paper/50 mt-1">
                        Every card is inspected and verified. If our scan doesn't match your card, we make it right.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Vault Link */}
              <Link
                to="/vault"
                className="flex items-center justify-center gap-2 text-sm text-paper/50 hover:text-mint transition-colors py-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue shopping
              </Link>

              {/* Debug info (only in dev) */}
              {import.meta.env.DEV && slugParts && (
                <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl text-xs">
                  <p className="font-semibold text-gold mb-2">Debug: Slug Parse</p>
                  <p className="text-paper/70">Card: {slugParts.cardName}</p>
                  <p className="text-paper/70">Set: {slugParts.setName}</p>
                  <p className="text-paper/70">Number: {slugParts.cardNumber || "N/A"}</p>
                  <p className="text-paper/70">Timestamp: {new Date(slugParts.timestamp).toISOString()}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
