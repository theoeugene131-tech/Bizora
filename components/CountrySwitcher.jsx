"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";

export default function CountrySwitcher() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("c") ?? DEFAULT_COUNTRY;

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/?c=${e.target.value}`)}
      className="bg-green-800 text-white text-sm rounded-lg px-2 py-1.5 border border-green-600"
      aria-label="Choose country"
    >
      {Object.values(COUNTRIES).map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.label}
        </option>
      ))}
    </select>
  );
}
