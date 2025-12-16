import { useQuery } from "@tanstack/react-query";

// Product shape from the vault API
export interface VaultProduct {
  id: string;
  name: string;
  set: string;
  number: string;
  condition: string;
  rarity: string | null;
  price: number;
  marketPrice: number;
  stock: number;
  /** Count of items actually available for checkout (excludes RESERVED) */
  availableStock: number;
  frontImage: string;
  backImage: string | null;
  slug: string;
  /** Variant tags (e.g., "First Edition", "Holo", "Reverse Holo") */
  variantTags: string[] | null;
}

export interface VaultPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface VaultProductsResponse {
  ok: boolean;
  products: VaultProduct[];
  pagination: VaultPagination;
}

export interface VaultFiltersResponse {
  ok: boolean;
  filters: {
    sets: Array<{ name: string; count: number }>;
    conditions: Array<{ name: string; count: number }>;
    rarities: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export interface VaultQueryParams {
  sets?: string[];
  conditions?: string[];
  rarities?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-low" | "price-high" | "name-az" | "newest";
  limit?: number;
  offset?: number;
  search?: string;
}

async function fetchVaultProducts(
  params: VaultQueryParams
): Promise<VaultProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params.sets?.length) {
    searchParams.set("sets", params.sets.join(","));
  }
  if (params.conditions?.length) {
    searchParams.set("conditions", params.conditions.join(","));
  }
  if (params.rarities?.length) {
    searchParams.set("rarities", params.rarities.join(","));
  }
  if (params.minPrice !== undefined) {
    searchParams.set("minPrice", params.minPrice.toString());
  }
  if (params.maxPrice !== undefined) {
    searchParams.set("maxPrice", params.maxPrice.toString());
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }

  const url = `/api/vault/products?${searchParams.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch vault products: ${res.status}`);
  }

  return res.json();
}

async function fetchVaultFilters(): Promise<VaultFiltersResponse> {
  const res = await fetch("/api/vault/filters");

  if (!res.ok) {
    throw new Error(`Failed to fetch vault filters: ${res.status}`);
  }

  return res.json();
}

export function useVaultProducts(params: VaultQueryParams) {
  return useQuery({
    queryKey: ["vault-products", params],
    queryFn: () => fetchVaultProducts(params),
    staleTime: 30_000, // 30 seconds
  });
}

export function useVaultFilters() {
  return useQuery({
    queryKey: ["vault-filters"],
    queryFn: fetchVaultFilters,
    staleTime: 60_000, // 1 minute
  });
}
