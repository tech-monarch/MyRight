"use client";

import { useMemo, useState } from "react";
import { SearchX, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResourceCard } from "@/components/resources/ResourceCard";
import {
  LEGAL_RESOURCES,
  RESOURCE_CATEGORIES,
  filterResources,
  getCategory,
  type PriceFilter,
  type ResourceCategoryId,
  type SortKey,
} from "@/lib/legal-resources";
import { cn } from "@/lib/utils";

const PRICE_OPTIONS: { id: PriceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "title", label: "Title: A to Z" },
];

export function ResourcesBrowser({
  initialQuery = "",
  initialCategory = "all",
}: {
  initialQuery?: string;
  initialCategory?: ResourceCategoryId | "all";
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ResourceCategoryId | "all">(initialCategory);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const results = useMemo(() => filterResources(LEGAL_RESOURCES, { query, category, price, sort }), [query, category, price, sort]);

  // Counts reflect the search and price filter, so a chip never promises results it can't show.
  const counts = useMemo(() => {
    const base = filterResources(LEGAL_RESOURCES, { query, category: "all", price, sort: "featured" });
    const byCategory = new Map<string, number>();
    for (const r of base) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1);
    return { all: base.length, byCategory };
  }, [query, price]);

  const filtersActive = query.trim() !== "" || category !== "all" || price !== "all";
  const showFeaturedStrip = !filtersActive && sort === "featured";
  const featured = useMemo(() => (showFeaturedStrip ? LEGAL_RESOURCES.filter((r) => r.featured).slice(0, 3) : []), [showFeaturedStrip]);
  const grid = showFeaturedStrip ? results.filter((r) => !featured.includes(r)) : results;

  function clearAll() {
    setQuery("");
    setCategory("all");
    setPrice("all");
    setSort("featured");
  }

  return (
    <div>
      {/* Search + secondary controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <label htmlFor="resource-search" className="sr-only">
            Search legal resources
          </label>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            id="resource-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, contracts and guides"
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-white py-3 pl-10 pr-10 text-sm text-navy shadow-card placeholder:text-text-muted focus:border-blue focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-surface-muted hover:text-navy">
              <X size={16} />
            </button>
          )}
        </div>

        <div role="group" aria-label="Price" className="inline-flex shrink-0 rounded-lg border border-border bg-white p-1 shadow-card">
          {PRICE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={price === o.id}
              onClick={() => setPrice(o.id)}
              className={cn("rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors", price === o.id ? "bg-navy text-white" : "text-text-muted hover:text-navy")}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="shrink-0">
          <label htmlFor="resource-sort" className="sr-only">
            Sort resources
          </label>
          <select
            id="resource-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm font-medium text-navy shadow-card focus:border-blue focus:outline-none md:w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div role="group" aria-label="Categories" className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {[{ id: "all" as const, label: "All resources", n: counts.all }, ...RESOURCE_CATEGORIES.map((c) => ({ id: c.id, label: c.label, n: counts.byCategory.get(c.id) ?? 0 }))].map((c) => {
          const active = category === c.id;
          const empty = c.n === 0 && !active;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              disabled={empty}
              onClick={() => setCategory(c.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active ? "border-navy bg-navy text-white" : "border-border bg-white text-navy hover:border-blue hover:text-blue",
                empty && "cursor-not-allowed opacity-40 hover:border-border hover:text-navy"
              )}
            >
              {c.label} <span className={cn("ml-1 text-xs", active ? "text-blue-light" : "text-text-muted")}>{c.n}</span>
            </button>
          );
        })}
      </div>

      {category !== "all" && <p className="mt-3 text-sm text-text-muted">{getCategory(category).blurb}</p>}

      {/* Results summary, announced politely to screen readers */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-text-muted">
          {results.length === LEGAL_RESOURCES.length && !filtersActive
            ? `${LEGAL_RESOURCES.length} resources`
            : `Showing ${results.length} of ${LEGAL_RESOURCES.length} resources`}
        </p>
        {filtersActive && (
          <button type="button" onClick={clearAll} className="text-sm font-semibold text-blue hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Featured strip: only when browsing the whole catalogue in its default order */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mt-4">
          <h2 id="featured-heading" className="flex items-center gap-2 text-lg font-extrabold text-navy">
            <Sparkles size={18} className="text-blue" /> Featured
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <ResourceCard key={r.slug} resource={r} />
            ))}
          </div>
        </section>
      )}

      {/* Main grid */}
      {results.length > 0 ? (
        grid.length > 0 && (
          <section aria-labelledby="all-heading" className={featured.length > 0 ? "mt-12" : "mt-4"}>
            {featured.length > 0 && (
              <h2 id="all-heading" className="text-lg font-extrabold text-navy">
                More resources
              </h2>
            )}
            <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", featured.length > 0 && "mt-4")}>
              {grid.map((r) => (
                <ResourceCard key={r.slug} resource={r} />
              ))}
            </div>
          </section>
        )
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-white px-6 py-14 text-center">
          <SearchX size={28} className="mx-auto text-text-muted" />
          <h2 className="mt-3 text-base font-bold text-navy">No resources match your search</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            {query.trim() ? <>Nothing matched &ldquo;{query.trim()}&rdquo; with the filters you&apos;ve chosen.</> : "Nothing matches the filters you've chosen."} Try a different word, or clear the filters.
          </p>
          <Button variant="secondary" className="mt-5" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
