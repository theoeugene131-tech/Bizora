"use client";

import { useMemo, useState } from "react";
import { productCategories } from "@/data/product-categories";
import { getCountry } from "@/lib/countries";
import ListingCard from "./ListingCard";
import BusinessCard from "./BusinessCard";

export default function MarketplaceExplorer({ listings, businesses = [], countryCode }) {
  const country = getCountry(countryCode);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All regions");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return listings
      .filter((l) => {
        const matchesQuery =
          !q || l.title.toLowerCase().includes(q) || (l.description ?? "").toLowerCase().includes(q) || l.category.toLowerCase().includes(q);
        const matchesCategory = category === "All" || l.category === category;
        const matchesRegion = region === "All regions" || l.state === region;
        return matchesQuery && matchesCategory && matchesRegion;
      })
      .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }, [listings, query, category, region]);

  const filteredBusinesses = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return businesses
      .filter((b) => {
        const matchesQuery =
          b.name.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.products ?? []).some((p) => p.name.toLowerCase().includes(q));
        const matchesCategory = category === "All" || b.category === category;
        const matchesRegion = region === "All regions" || b.state === region;
        return matchesQuery && matchesCategory && matchesRegion;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      .slice(0, 12);
  }, [businesses, query, category, region]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses or products..."
          aria-label="Search businesses or products"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
        >
          <option>All</option>
          {productCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
        >
          <option>All regions</option>
          {country.regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} product(s) found{filteredBusinesses.length > 0 ? ` · ${filteredBusinesses.length} business(es) match` : ""} {query && `(for "${query}")`}
      </p>

      {filteredBusinesses.length > 0 && (
        <>
          <h3 className="font-semibold text-gray-900 mb-3">Businesses matching "{query}"</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredBusinesses.map((b, i) => (
              <BusinessCard key={b.id} business={b} index={i} currency={country.currency} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && filteredBusinesses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No products or businesses found for "{query || "—"}" — try another term or be the first to sell!</div>
      ) : filtered.length === 0 ? null : (
        <>
          {filteredBusinesses.length > 0 && <h3 className="font-semibold text-gray-900 mb-3">Products</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} currency={country.currency} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
