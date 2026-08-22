"use client";

import { useMemo } from "react";
import { formatNaira } from "@/lib/format";

// Groups a list of records by a YYYY-MM-DD date string derived from
// created_at, returning counts for the last `days` days (oldest first).
function lastNDaysCounts(records, days, dateKey = "created_at", valueFn = () => 1) {
  const buckets = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  records.forEach((r) => {
    const key = r[dateKey]?.slice(0, 10);
    if (key in buckets) buckets[key] += valueFn(r);
  });
  return Object.entries(buckets).map(([date, value]) => ({ date, value }));
}

function BarChart({ data, formatValue = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
          <div
            className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? "3px" : "0" }}
          />
          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
            {d.date.slice(5)}: {formatValue(d.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ items, labelKey = "category" }) {
  const counts = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      const k = i[labelKey] || "Uncategorized";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items, labelKey]);

  const max = Math.max(1, ...counts.map(([, c]) => c));

  if (counts.length === 0) return <p className="text-sm text-gray-400">No data yet.</p>;

  return (
    <div className="space-y-2">
      {counts.map(([label, count]) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <span className="w-32 shrink-0 text-gray-600 truncate">{label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-green-600 h-full rounded-full" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right text-gray-500 font-medium">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics({ businesses, listings, payments }) {
  const totalBusinessViews = businesses.reduce((s, b) => s + (b.views ?? 0), 0);
  const totalListingViews = listings.reduce((s, l) => s + (l.views ?? 0), 0);

  const topBusinesses = [...businesses]
    .filter((b) => b.status === "approved")
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  const topListings = [...listings]
    .filter((l) => l.status === "approved")
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  const growthData = useMemo(() => {
    const combined = [
      ...businesses.map((b) => ({ created_at: b.created_at })),
      ...listings.map((l) => ({ created_at: l.created_at })),
    ];
    return lastNDaysCounts(combined, 14);
  }, [businesses, listings]);

  const revenueData = useMemo(() => {
    const successful = payments.filter((p) => p.status === "success");
    return lastNDaysCounts(successful, 14, "created_at", (p) => Number(p.amount));
  }, [payments]);

  const revenueTotal14d = revenueData.reduce((s, d) => s + d.value, 0);
  const newCount14d = growthData.reduce((s, d) => s + d.value, 0);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <h2 className="text-lg font-bold">📊 Analytics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat label="Total business views" value={totalBusinessViews.toLocaleString()} />
        <MiniStat label="Total listing views" value={totalListingViews.toLocaleString()} />
        <MiniStat label="New listings (14d)" value={newCount14d} />
        <MiniStat label="Revenue (14d)" value={formatNaira(revenueTotal14d)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold mb-2">New businesses + listings, last 14 days</p>
          <BarChart data={growthData} />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Revenue, last 14 days</p>
          <BarChart data={revenueData} formatValue={(v) => `₦${v.toLocaleString()}`} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold mb-2">🏆 Most-viewed businesses</p>
          {topBusinesses.length === 0 ? (
            <p className="text-sm text-gray-400">No approved businesses yet.</p>
          ) : (
            <ol className="space-y-1.5 text-sm">
              {topBusinesses.map((b, i) => (
                <li key={b.id} className="flex justify-between">
                  <span className="text-gray-700 truncate">{i + 1}. {b.name}</span>
                  <span className="text-gray-500 font-medium shrink-0 ml-2">{(b.views ?? 0).toLocaleString()} views</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">🏆 Most-viewed listings</p>
          {topListings.length === 0 ? (
            <p className="text-sm text-gray-400">No approved listings yet.</p>
          ) : (
            <ol className="space-y-1.5 text-sm">
              {topListings.map((l, i) => (
                <li key={l.id} className="flex justify-between">
                  <span className="text-gray-700 truncate">{i + 1}. {l.title}</span>
                  <span className="text-gray-500 font-medium shrink-0 ml-2">{(l.views ?? 0).toLocaleString()} views</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold mb-2">Businesses by category</p>
          <CategoryBars items={businesses.filter((b) => b.status === "approved")} />
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Listings by category</p>
          <CategoryBars items={listings.filter((l) => l.status === "approved")} />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-green-700">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
