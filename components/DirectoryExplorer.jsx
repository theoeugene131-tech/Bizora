"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/categories";
import { getCountry } from "@/lib/countries";
import BusinessCard from "./BusinessCard";

export default function DirectoryExplorer({ businesses, countryCode }) {
  const country = getCountry(countryCode);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All regions");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return businesses
      .filter((b) => {
        const matchesQuery =
          !q ||
          b.name.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q);
        const matchesCategory = category === "All" || b.category === category;
        const matchesRegion = region === "All regions" || b.state === region;
        return matchesQuery && matchesCategory && matchesRegion;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [businesses, query, category, region]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses..."
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

      <p className="text-sm text-gray-500 mb-4">{filtered.length} business(es) found</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No businesses here yet. Be the first —{" "}
          <span className="text-green-700 font-medium">add your business free!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b, i) => (
            <BusinessCard key={b.id} business={b} index={i} currency={country.currency} />
          ))}
        </div>
      )}
    </section>
  );
}
