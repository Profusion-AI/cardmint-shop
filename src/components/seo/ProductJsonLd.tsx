import React from "react";

type Availability = "in_stock" | "out_of_stock" | "preorder";

export type ProductJsonLdProps = {
  name: string;
  sku: string; // canonical listing SKU
  url: string; // canonical SKU route
  image: string; // thumbnail URL (low-res)
  description?: string;
  brandName?: string;
  price: number;
  currency?: string; // default USD
  availability: Availability;
  itemCondition?: "NewCondition" | "UsedCondition";
};

function availabilityToSchema(avail: Availability): string {
  switch (avail) {
    case "in_stock":
      return "https://schema.org/InStock";
    case "preorder":
      return "https://schema.org/PreOrder";
    default:
      return "https://schema.org/OutOfStock";
  }
}

export const ProductJsonLd: React.FC<ProductJsonLdProps> = ({
  name,
  sku,
  url,
  image,
  description,
  brandName,
  price,
  currency = "USD",
  availability,
  itemCondition = "UsedCondition",
}) => {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku,
    url,
    image,
    ...(description ? { description } : {}),
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: availabilityToSchema(availability),
      itemCondition: `https://schema.org/${itemCondition}`,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
};

export default ProductJsonLd;

