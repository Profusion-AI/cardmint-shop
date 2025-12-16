import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  X,
  Grid3X3,
  List,
  SlidersHorizontal,
  Sparkles,
  Eye,
  AlertCircle,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useVaultProducts,
  useVaultFilters,
  type VaultProduct,
} from "@/hooks/useVaultProducts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";

// Condition display mapping
const CONDITION_LABELS: Record<string, { name: string; abbr: string }> = {
  NM: { name: "Near Mint", abbr: "NM" },
  LP: { name: "Lightly Played", abbr: "LP" },
  MP: { name: "Moderately Played", abbr: "MP" },
  HP: { name: "Heavily Played", abbr: "HP" },
  UNKNOWN: { name: "Unknown", abbr: "?" },
};

// Era chip component
function EraChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${active
          ? "bg-mint text-midnight shadow-lg shadow-mint/25"
          : "bg-white/5 text-paper/70 hover:bg-white/10 hover:text-paper border border-white/10"
        }
      `}
    >
      {active && (
        <span className="absolute inset-0 rounded-full bg-mint/20 animate-pulse" />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

// Filter dropdown component (accepts array of {name, count?})
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  getOptionLabel,
}: {
  label: string;
  options: Array<{ name: string; count?: number }>;
  selected: Set<string>;
  onToggle: (name: string) => void;
  getOptionLabel?: (opt: { name: string; count?: number }) => string;
}) {
  const hasSelection = selected.size > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`
            gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20
            ${hasSelection ? "border-mint/50 text-mint" : "text-paper/80"}
          `}
        >
          {label}
          {hasSelection && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-mint/20 text-mint">
              {selected.size}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 max-h-80 overflow-y-auto border-white/10 bg-midnight/98 backdrop-blur-xl"
      >
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.name}
            checked={selected.has(opt.name)}
            onCheckedChange={() => onToggle(opt.name)}
            className="text-paper/80 focus:bg-white/10 focus:text-paper"
          >
            {getOptionLabel ? getOptionLabel(opt) : opt.name}
            {opt.count !== undefined && (
              <span className="ml-auto text-xs text-paper/40">({opt.count})</span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Active filter chip
function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 text-mint text-sm border border-mint/30">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-mint/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search bar component - vintage card shop terminal aesthetic
function VaultSearchBar({
  value,
  onChange,
  isSearching,
  resultCount,
}: {
  value: string;
  onChange: (value: string) => void;
  isSearching: boolean;
  resultCount: number | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Outer glow container */}
      <div
        className={`
          absolute -inset-1 rounded-2xl transition-all duration-500
          ${isFocused
            ? "bg-gradient-to-r from-mint/20 via-aqua/20 to-mint/20 blur-xl opacity-100"
            : "bg-gradient-to-r from-mint/5 via-aqua/5 to-mint/5 blur-lg opacity-0"
          }
        `}
      />

      {/* Main search container */}
      <div
        className={`
          relative flex items-center gap-3 px-5 py-4
          bg-white/[0.03] backdrop-blur-xl
          border rounded-xl
          transition-all duration-300
          ${isFocused
            ? "border-mint/50 shadow-[0_0_30px_rgba(74,220,97,0.15)]"
            : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {/* Scan line effect (subtle retro touch) */}
        <div
          className={`
            absolute inset-0 rounded-xl overflow-hidden pointer-events-none
            ${isFocused ? "opacity-100" : "opacity-0"}
            transition-opacity duration-300
          `}
        >
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-mint/[0.02] to-transparent"
            style={{
              animation: isFocused ? "scanline 3s linear infinite" : "none",
              backgroundSize: "100% 8px",
            }}
          />
        </div>

        {/* Search icon */}
        <div className="relative flex-shrink-0">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-mint animate-spin" />
          ) : (
            <Search
              className={`h-5 w-5 transition-colors duration-200 ${
                isFocused ? "text-mint" : "text-paper/40"
              }`}
            />
          )}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search cards, sets, numbers..."
          className="
            flex-1 bg-transparent text-paper placeholder:text-paper/30
            text-lg font-light tracking-wide
            outline-none border-none
            caret-mint
          "
          aria-label="Search the vault"
        />

        {/* Clear button / keyboard hint */}
        <div className="relative flex-shrink-0 flex items-center gap-2">
          {value ? (
            <button
              onClick={() => onChange("")}
              className="
                p-1.5 rounded-lg
                bg-white/5 hover:bg-white/10
                text-paper/50 hover:text-paper
                transition-all duration-200
                hover:scale-105 active:scale-95
              "
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd
              className={`
                hidden sm:inline-flex items-center gap-1 px-2 py-1
                text-xs font-mono rounded-md
                transition-all duration-200
                ${isFocused
                  ? "bg-mint/10 text-mint border border-mint/30"
                  : "bg-white/5 text-paper/30 border border-white/10"
                }
              `}
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Live result indicator */}
      {value && (
        <div
          className="
            absolute -bottom-6 left-1/2 -translate-x-1/2
            text-xs text-paper/50
            animate-in fade-in slide-in-from-top-1 duration-200
          "
        >
          {isSearching ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-mint animate-pulse" />
              Searching...
            </span>
          ) : resultCount !== null ? (
            <span>
              <span className="text-mint font-medium">{resultCount}</span>
              {" "}card{resultCount !== 1 ? "s" : ""} found
            </span>
          ) : null}
        </div>
      )}

      {/* Inline keyframe for scan line */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

// Product card component
function ProductCard({
  product,
  viewMode,
}: {
  product: VaultProduct;
  viewMode: "grid" | "list";
}) {
  const [showBack, setShowBack] = useState(false);
  const isMobile = useIsMobile();
  const conditionInfo = CONDITION_LABELS[product.condition] ?? CONDITION_LABELS.UNKNOWN;

  // Use availableStock for checkout-related checks (excludes RESERVED items)
  const availableStock = product.availableStock ?? product.stock;
  const isLowStock = availableStock > 0 && availableStock <= 2;
  const isBelowMarket = product.price < product.marketPrice;
  const hasBackImage = !!product.backImage;

  // Handle flip button click (mobile) - prevent navigation
  const handleFlipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBack((prev) => !prev);
  };

  if (viewMode === "list") {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="group flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-mint/30 hover:bg-white/[0.07] transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-24 h-32 flex-shrink-0">
          <img
            src={showBack && hasBackImage ? product.backImage! : product.frontImage}
            alt={product.name}
            className="w-full h-full object-contain rounded-xl"
          />
          {/* Scanned badge */}
          <div className="absolute -top-1 -right-1 bg-gold/90 text-midnight text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            SCAN
          </div>
          {/* Mobile flip button for list view */}
          {hasBackImage && isMobile && (
            <button
              onClick={handleFlipClick}
              className="absolute -bottom-1 -left-1 bg-white/90 hover:bg-white text-midnight p-1.5 rounded-full shadow-lg transition-all duration-200 active:scale-95 z-10"
              aria-label={showBack ? "View front" : "View back"}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg text-paper group-hover:text-mint transition-colors truncate">
                {product.name}
              </h3>
              <p className="text-sm text-paper/60">
                {product.set} · #{product.number}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display text-xl text-paper">${product.price.toFixed(2)}</p>
              {isBelowMarket && (
                <p className="text-xs text-aqua">
                  Market: ${product.marketPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="border-white/20 text-paper/70 text-xs">
              {conditionInfo.abbr}
            </Badge>
            {product.rarity && (
              <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                {product.rarity}
              </Badge>
            )}
            {product.variantTags?.map((tag) => (
              <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                {tag}
              </Badge>
            ))}
            {isLowStock && (
              <span className="flex items-center gap-1 text-xs text-gold">
                <AlertCircle className="h-3 w-3" />
                {availableStock === 1 ? "Last one" : `Only ${availableStock}`}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative block rounded-2xl bg-white/5 border border-white/10 hover:border-mint/30 hover:bg-white/[0.07] transition-all duration-300 overflow-hidden"
    >
      {/* Image container */}
      <div
        className="relative aspect-[3/4] p-4 bg-gradient-to-b from-white/5 to-transparent"
        onMouseEnter={() => hasBackImage && setShowBack(true)}
        onMouseLeave={() => setShowBack(false)}
      >
        <img
          src={showBack && hasBackImage ? product.backImage! : product.frontImage}
          alt={product.name}
          className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Scanned badge */}
        <div className="absolute top-2 right-2 bg-gold/90 text-midnight text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Eye className="h-3 w-3" />
          SCANNED
        </div>

        {/* Mobile flip button - always visible on mobile when back image exists */}
        {hasBackImage && isMobile && (
          <button
            onClick={handleFlipClick}
            className="absolute bottom-2 left-2 bg-white/90 hover:bg-white text-midnight p-2 rounded-full shadow-lg transition-all duration-200 active:scale-95 z-10"
            aria-label={showBack ? "View front" : "View back"}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        {/* View back hint - desktop: show on hover, mobile: show when back exists */}
        {hasBackImage && (
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-paper/50 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm transition-opacity duration-300 ${
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            {showBack ? "Viewing back" : (isMobile ? "Tap ↻ for back" : "Hover for back")}
          </div>
        )}

        {/* Low stock indicator */}
        {isLowStock && (
          <div className="absolute top-2 left-2 bg-cardmint-red/90 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {availableStock === 1 ? "LAST ONE" : `ONLY ${availableStock}`}
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="p-4 pt-2">
        <h3 className="font-display text-lg text-paper group-hover:text-mint transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-sm text-paper/60 truncate">
          {product.set} · #{product.number}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className="border-white/20 text-paper/70 text-xs">
            {conditionInfo.abbr}
          </Badge>
          {product.rarity && (
            <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
              {product.rarity}
            </Badge>
          )}
          {product.variantTags?.map((tag) => (
            <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <p className="font-display text-xl text-paper">${product.price.toFixed(2)}</p>
          {isBelowMarket && (
            <p className="text-xs text-aqua line-through opacity-70">
              ${product.marketPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Vault() {
  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Filter state (using set names directly from API)
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());
  const [selectedRarities, setSelectedRarities] = useState<Set<string>>(new Set());

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "name-az" | "newest">("newest");

  // Fetch available filters from API
  const { data: filtersData } = useVaultFilters();
  const filters = filtersData?.filters;

  // Max results we can display (no pagination yet)
  const VAULT_LIMIT = 100;

  // Trimmed debounced search (matches backend behavior)
  const trimmedDebouncedSearch = debouncedSearch.trim();

  // Build query params for products API
  const queryParams = useMemo(() => ({
    sets: selectedSets.size > 0 ? Array.from(selectedSets) : undefined,
    conditions: selectedConditions.size > 0 ? Array.from(selectedConditions) : undefined,
    rarities: selectedRarities.size > 0 ? Array.from(selectedRarities) : undefined,
    search: trimmedDebouncedSearch || undefined,
    sort: sortBy,
    limit: VAULT_LIMIT,
  }), [selectedSets, selectedConditions, selectedRarities, trimmedDebouncedSearch, sortBy]);

  // Fetch products from API
  const { data: productsData, isLoading, error, isFetching } = useVaultProducts(queryParams);
  const products = productsData?.products ?? [];
  const pagination = productsData?.pagination;

  // Determine if we're actively searching (trimmed input differs from trimmed debounced value)
  const isSearching = searchInput.trim() !== trimmedDebouncedSearch || isFetching;

  // Cap displayed result count to what we can actually show
  const displayedResultCount = pagination?.total !== undefined
    ? Math.min(pagination.total, VAULT_LIMIT)
    : null;

  // Toggle helpers
  const toggleSet = (name: string) => {
    setSelectedSets((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleCondition = (name: string) => {
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleRarity = (name: string) => {
    setSelectedRarities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Clear all filters (including search)
  const clearAllFilters = () => {
    setSearchInput("");
    setSelectedSets(new Set());
    setSelectedConditions(new Set());
    setSelectedRarities(new Set());
  };

  // Use trimmed search for determining active state (matches backend behavior)
  const trimmedSearch = searchInput.trim();

  const hasActiveFilters =
    trimmedSearch.length > 0 ||
    selectedSets.size > 0 ||
    selectedConditions.size > 0 ||
    selectedRarities.size > 0;

  // Build active filter chips
  const activeFilterChips: { key: string; label: string; onRemove: () => void }[] = [];

  // Add search as a chip if active (only if non-whitespace)
  if (trimmedSearch) {
    activeFilterChips.push({
      key: "search",
      label: `"${trimmedSearch}"`,
      onRemove: () => setSearchInput(""),
    });
  }

  selectedSets.forEach((name) => {
    activeFilterChips.push({
      key: `set-${name}`,
      label: name,
      onRemove: () => toggleSet(name),
    });
  });
  selectedConditions.forEach((name) => {
    const label = CONDITION_LABELS[name]?.name ?? name;
    activeFilterChips.push({
      key: `cond-${name}`,
      label,
      onRemove: () => toggleCondition(name),
    });
  });
  selectedRarities.forEach((name) => {
    activeFilterChips.push({
      key: `rar-${name}`,
      label: name,
      onRemove: () => toggleRarity(name),
    });
  });

  return (
    <div className="min-h-screen bg-oxford-blue">
      {/* Hero header */}
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            WotC Era 1999–2001
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-paper mb-4">
            The <span className="text-mint">Vault</span>
          </h1>
          <p className="text-paper/60 text-lg max-w-2xl mx-auto mb-10">
            Curated vintage Pokémon cards. Every listing shows the exact card you'll receive — scanned, not stock.
          </p>

          {/* Search bar */}
          <VaultSearchBar
            value={searchInput}
            onChange={setSearchInput}
            isSearching={isSearching}
            resultCount={trimmedDebouncedSearch ? displayedResultCount : null}
          />
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 px-4 py-4 bg-oxford-blue/95 backdrop-blur-md border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            {/* All Filters button (mobile-first) */}
            <Button
              variant="outline"
              className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-paper/80 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-1 h-5 px-1.5 text-xs bg-mint text-midnight">
                  {activeFilterChips.length}
                </Badge>
              )}
            </Button>

            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-3">
              {filters?.sets && filters.sets.length > 0 && (
                <FilterDropdown
                  label="Set"
                  options={filters.sets}
                  selected={selectedSets}
                  onToggle={toggleSet}
                />
              )}
              {filters?.conditions && filters.conditions.length > 0 && (
                <FilterDropdown
                  label="Condition"
                  options={filters.conditions}
                  selected={selectedConditions}
                  onToggle={toggleCondition}
                  getOptionLabel={(opt) => CONDITION_LABELS[opt.name]?.name ?? opt.name}
                />
              )}
              {filters?.rarities && filters.rarities.length > 0 && (
                <FilterDropdown
                  label="Rarity"
                  options={filters.rarities}
                  selected={selectedRarities}
                  onToggle={toggleRarity}
                />
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Results count */}
            <span className="text-sm text-paper/50">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline" />
              ) : (
                <>
                  <span className="font-semibold text-paper">{pagination?.total ?? products.length}</span> results
                </>
              )}
            </span>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-40 border-white/10 bg-white/5 text-paper/80 hover:bg-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-midnight/98 backdrop-blur-xl">
                <SelectItem value="newest" className="text-paper/80 focus:bg-white/10">
                  Newest
                </SelectItem>
                <SelectItem value="price-low" className="text-paper/80 focus:bg-white/10">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high" className="text-paper/80 focus:bg-white/10">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="name-az" className="text-paper/80 focus:bg-white/10">
                  Name: A to Z
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-mint text-midnight"
                    : "text-paper/50 hover:text-paper hover:bg-white/10"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-mint text-midnight"
                    : "text-paper/50 hover:text-paper hover:bg-white/10"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {activeFilterChips.map((chip) => (
                <ActiveFilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={chip.onRemove}
                />
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-paper/50 hover:text-paper underline underline-offset-2 ml-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product grid */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading state */}
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 text-mint animate-spin mx-auto mb-4" />
              <p className="text-paper/50">Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cardmint-red/10 mb-4">
                <AlertCircle className="h-8 w-8 text-cardmint-red" />
              </div>
              <h3 className="font-display text-xl text-paper mb-2">Unable to load inventory</h3>
              <p className="text-paper/50 mb-6">
                {error instanceof Error ? error.message : "Please try again later."}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Sparkles className="h-8 w-8 text-paper/30" />
              </div>
              <h3 className="font-display text-xl text-paper mb-2">No cards found</h3>
              <p className="text-paper/50 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "Check back soon — new inventory is added regularly."}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="border-mint/50 text-mint hover:bg-mint/10"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="list" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Vault update notice */}
      <section className="px-4 pb-12 pt-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-paper/40 text-sm italic">
            Check back for new additions — the Vault is updated (nearly) daily.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
