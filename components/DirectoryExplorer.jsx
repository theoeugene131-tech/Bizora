"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/data/categories";
import { getCountry } from "@/lib/countries";
import BusinessCard from "./BusinessCard";

const PAGE_SIZE = 24;
export default function DirectoryExplorer({ businesses, countryCode }) {
  const country = getCountry(countryCode);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All regions");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return businesses
      .filter((b) => {
        const matchesQuery =
          !q ||
          b.name.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.state.toLowerCase().includes(q) ||
          (b.products ?? []).some((p) => p.name.toLowerCase().includes(q) || String(p.price).includes(q));
        const matchesCategory = category === "All" || b.category === category;
        const matchesRegion = region === "All regions" || b.state === region;
        return matchesQuery && matchesCategory && matchesRegion;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [businesses, query, category, region]);

  // Reset page when filters change to avoid blank page
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  useEffect(() => setPage(1), [query, category, region]);

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
          {categories.map((c) => (
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

      <p className="text-sm text-gray-500 mb-4">{filtered.length} business(es) found — page {page} of {pageCount}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No businesses here yet. Be the first —{" "}
          <span className="text-green-700 font-medium">add your business free!</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paged.map((b, i) => (
              <BusinessCard key={b.id} business={b} index={(page - 1) * PAGE_SIZE + i} currency={country.currency} />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 text-sm">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-40">← Prev</button>
              <span>Page {page} of {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage((p) => p + 1)} className="border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
