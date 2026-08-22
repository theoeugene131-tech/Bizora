"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { formatNaira } from "@/lib/format";
import AdminAnalytics from "./AdminAnalytics";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

const PAGE_SIZE = 50;

export default function AdminDashboard() {
  const supabase = getSupabase();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [listings, setListings] = useState([]);
  const [ads, setAds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    const [{ data: biz }, { data: list }, { data: adRows }, { data: pays }] = await Promise.all([
      supabase.from("businesses").select("*, products(*)").order("created_at", { ascending: false }),
      supabase.from("listings").select("*").order("created_at", { ascending: false }),
      supabase.from("ads").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
    ]);
    setBusinesses(biz ?? []);
    setListings(list ?? []);
    setAds(adRows ?? []);
    setPayments(pays ?? []);
    setSelected(new Set());
  }, [supabase]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function adminCall(path, body) {
    const { data } = await supabase.auth.getSession();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    return res;
  }

  async function login(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginError(error?.message ?? "");
  }

  async function singleAction(path, body) {
    setBusy(path + (body.slug ?? ""));
    const res = await adminCall(path, body);
    setBusy("");
    if (!res.ok) alert((await res.json()).message ?? "Something went wrong");
    else load();
  }

  async function uploadFor(slug, file) {
    setBusy(slug);
    try {
      const url = await uploadImage(file, `businesses/${slug}-${Date.now()}`);
      await singleAction("/api/admin/update", { slug, imageUrl: url });
    } catch (err) {
      alert(err.message);
      setBusy("");
    }
  }

  async function bulkAction(action, { slugs, category, filterStatus } = {}) {
    const label = slugs ? `${slugs.length} selected businesses` : `all "${category}" businesses`;
    if (!window.confirm(`${action.toUpperCase()} ${label}? This cannot be easily undone.`)) return;
    setBusy("bulk");
    const res = await adminCall("/api/admin/bulk", { action, slugs, category, filterStatus });
    setBusy("");
    if (!res.ok) {
      alert((await res.json()).message ?? "Bulk action failed");
      return;
    }
    const { count } = await res.json();
    alert(`Done — ${count} business(es) affected.`);
    load();
  }

  const pending = useMemo(() => businesses.filter((b) => b.status === "pending"), [businesses]);
  const approved = useMemo(() => businesses.filter((b) => b.status === "approved"), [businesses]);
  const pendingListings = useMemo(() => listings.filter((l) => l.status === "pending"), [listings]);
  const approvedListings = useMemo(() => listings.filter((l) => l.status === "approved"), [listings]);
  const pendingAds = useMemo(() => ads.filter((a) => a.status === "pending"), [ads]);
  const approvedAds = useMemo(() => ads.filter((a) => a.status === "approved"), [ads]);

  const categories = useMemo(
    () => Array.from(new Set(pending.map((b) => b.category))).sort(),
    [pending]
  );

  const filteredPending = useMemo(
    () => (categoryFilter === "All" ? pending : pending.filter((b) => b.category === categoryFilter)),
    [pending, categoryFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filteredPending.length / PAGE_SIZE));
  const pagedPending = filteredPending.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [categoryFilter]);

  function toggleSelected(slug) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pagedPending.every((b) => next.has(b.slug));
      pagedPending.forEach((b) => (allSelected ? next.delete(b.slug) : next.add(b.slug)));
      return next;
    });
  }

  if (checking) return <p className="text-center py-16 text-gray-500">Loading…</p>;

  if (!session) {
    return (
      <form onSubmit={login} className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold">Admin login</h1>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
        <button className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-lg hover:bg-green-800">
          Sign in
        </button>
      </form>
    );
  }

  const revenue = payments.filter((p) => p.status === "success").reduce((sum, p) => sum + Number(p.amount), 0);
  const selectedOnPage = pagedPending.every((b) => b.slug && selected.has(b.slug)) && pagedPending.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-600 hover:underline">
          Log out
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Pending review" value={pending.length} />
        <Stat label="Live businesses" value={approved.length} />
        <Stat label="Pending listings" value={pendingListings.length} />
        <Stat label="Live listings" value={approvedListings.length} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Featured businesses" value={approved.filter((b) => b.is_featured).length} />
        <Stat label="Featured listings" value={approvedListings.filter((l) => l.is_featured).length} />
        <Stat label="Total revenue" value={formatNaira(revenue)} />
      </div>

      <AdminAnalytics businesses={businesses} listings={listings} payments={payments} />

      <CsvUpload onImported={load} adminCall={adminCall} />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">⏳ Pending review ({filteredPending.length} of {pending.length})</h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {categoryFilter !== "All" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">
              Bulk action for all "{categoryFilter}" pending businesses ({pending.filter((b) => b.category === categoryFilter).length}):
            </span>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("approve", { category: categoryFilter, filterStatus: "pending" })}
              className="bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              ✔ Approve all in category
            </button>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("reject", { category: categoryFilter, filterStatus: "pending" })}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              ✕ Reject all in category
            </button>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("delete", { category: categoryFilter, filterStatus: "pending" })}
              className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              🗑 Delete all in category
            </button>
          </div>
        )}

        {selected.size > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{selected.size} selected:</span>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("approve", { slugs: [...selected] })}
              className="bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              ✔ Approve selected
            </button>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("reject", { slugs: [...selected] })}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              ✕ Reject selected
            </button>
            <button
              disabled={busy === "bulk"}
              onClick={() => bulkAction("delete", { slugs: [...selected] })}
              className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
            >
              🗑 Delete selected
            </button>
          </div>
        )}

        {pagedPending.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing here. 🎉</p>
        ) : (
          <>
            <label className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <input type="checkbox" checked={selectedOnPage} onChange={toggleSelectAllOnPage} />
              Select all {pagedPending.length} on this page
            </label>

            <div className="space-y-3">
              {pagedPending.map((b) => (
                <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(b.slug)}
                      onChange={() => toggleSelected(b.slug)}
                      className="mt-1"
                    />
                    {b.image_url && <img src={b.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-xs text-green-700 font-medium">
                        {b.category} · 📍 {b.city}, {b.state}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        📞 {b.phone} {b.submitter_email && `· ✉️ ${b.submitter_email}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={!!busy}
                      onClick={() => singleAction("/api/admin/update", { slug: b.slug, status: "approved" })}
                      className="bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-50"
                    >
                      ✔ Approve
                    </button>
                    <button
                      disabled={!!busy}
                      onClick={() => singleAction("/api/admin/update", { slug: b.slug, status: "rejected" })}
                      className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>Page {page} of {pageCount}</span>
                <button
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">🟢 Live businesses ({approved.length})</h2>
        <div className="space-y-3">
          {approved.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-200" />
              )}
              <div className="flex-1 min-w-[180px]">
                <p className="font-semibold">
                  {b.name} {b.is_featured && <span className="text-yellow-600">★</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {b.category} · {b.city}, {b.state} · {b.products?.length ?? 0} products
                </p>
              </div>
              <label className="cursor-pointer text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                📷 {b.image_url ? "Replace photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && uploadFor(b.slug, e.target.files[0])}
                />
              </label>
              <button
                onClick={() => singleAction("/api/admin/update", { slug: b.slug, featured: !b.is_featured })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-yellow-50"
              >
                {b.is_featured ? "Unfeature" : "★ Feature"}
              </button>
              <a href={`/business/${b.slug}`} target="_blank" className="text-sm text-green-700 hover:underline">
                View
              </a>
              <button
                onClick={() =>
                  window.confirm(`Delete ${b.name}? This cannot be undone.`) &&
                  singleAction("/api/admin/delete", { slug: b.slug })
                }
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">🛍️ Pending product listings ({pendingListings.length})</h2>
        {pendingListings.length === 0 && <p className="text-sm text-gray-500">Nothing waiting. 🎉</p>}
        <div className="space-y-3">
          {pendingListings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {l.image_url && <img src={l.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-xs text-green-700 font-medium">
                    {l.category} · ₦{Number(l.price).toLocaleString()} · 📍 {l.city}, {l.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    📞 {l.seller_phone} {l.seller_name && `· ${l.seller_name}`} {l.paid && "· 💰 Paid"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  disabled={!!busy}
                  onClick={() => singleAction("/api/admin/listings/update", { slug: l.slug, status: "approved" })}
                  className="bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  ✔ Approve
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => singleAction("/api/admin/listings/update", { slug: l.slug, status: "rejected" })}
                  className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">🛍️ Live product listings ({approvedListings.length})</h2>
        <div className="space-y-3">
          {approvedListings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
              {l.image_url ? (
                <img src={l.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-200" />
              )}
              <div className="flex-1 min-w-[180px]">
                <p className="font-semibold">
                  {l.title} {l.is_featured && <span className="text-yellow-600">★</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {l.category} · ₦{Number(l.price).toLocaleString()} · {l.city}, {l.state}
                </p>
              </div>
              <button
                onClick={() => singleAction("/api/admin/listings/update", { slug: l.slug, featured: !l.is_featured })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-purple-50"
              >
                {l.is_featured ? "Remove A-List" : "🅰 Make A-List"}
              </button>
              <a href={`/listing/${l.slug}`} target="_blank" className="text-sm text-green-700 hover:underline">
                View
              </a>
              <button
                onClick={() =>
                  window.confirm(`Delete "${l.title}"? This cannot be undone.`) &&
                  singleAction("/api/admin/listings/delete", { slug: l.slug })
                }
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">📢 Banner ads — pending ({pendingAds.length})</h2>
        {pendingAds.length === 0 && <p className="text-sm text-gray-500">Nothing waiting. 🎉</p>}
        <div className="space-y-3">
          {pendingAds.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-gray-600 mt-1">{a.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                🔗 {a.link} {a.advertiser_name && `· ${a.advertiser_name}`}{" "}
                {a.advertiser_phone && `· 📞 ${a.advertiser_phone}`}
                {a.paid_until && ` · Paid until ${new Date(a.paid_until).toLocaleDateString()}`}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  disabled={!!busy}
                  onClick={() => singleAction("/api/admin/ads/update", { id: a.id, status: "approved" })}
                  className="bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  ✔ Approve
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => singleAction("/api/admin/ads/update", { id: a.id, status: "rejected" })}
                  className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">📢 Banner ads — live ({approvedAds.length})</h2>
        <div className="space-y-3">
          {approvedAds.map((a) => {
            const expired = a.paid_until && new Date(a.paid_until) < new Date();
            return (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-semibold">
                    {a.title} {expired && <span className="text-red-600 text-xs">(⚠️ expired)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    🔗 {a.link} {a.paid_until && `· Paid until ${new Date(a.paid_until).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    window.confirm(`Remove ad "${a.title}"?`) &&
                    singleAction("/api/admin/ads/delete", { id: a.id })
                  }
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {busy && <p className="text-sm text-gray-500">Working…</p>}
    </div>
  );
}

function CsvUpload({ onImported, adminCall }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [importStatus, setImportStatus] = useState("pending");

  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      const row = {};
      headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
      return row;
    });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result));
      setRows(parsed);
      setMessage("");
    };
    reader.readAsText(file);
  }

  async function doImport() {
    setStatus("importing");
    setMessage("");
    const res = await adminCall("/api/admin/csv-import", { rows, status: importStatus });
    const json = await res.json();
    setStatus("idle");
    if (!res.ok) {
      setMessage(`Error: ${json.message}`);
      return;
    }
    setMessage(`Imported ${json.inserted} businesses (${json.skipped} skipped for missing required fields).`);
    setRows([]);
    setFileName("");
    onImported();
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-bold mb-2">📄 Bulk-add from CSV</h2>
      <p className="text-sm text-gray-500 mb-3">
        Upload a CSV with columns: <code className="bg-gray-100 px-1 rounded">name, category, description, street, city, state, phone, email, website, country</code>.
        Only name, category, city, state and phone are required per row.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv" onChange={handleFile} className="text-sm" />
        <select
          value={importStatus}
          onChange={(e) => setImportStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="pending">Import as Pending</option>
          <option value="approved">Import as Approved (goes live immediately)</option>
        </select>
        {rows.length > 0 && (
          <button
            onClick={doImport}
            disabled={status === "importing"}
            className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {status === "importing" ? "Importing…" : `Import ${rows.length} rows from ${fileName}`}
          </button>
        )}
      </div>
      {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-2xl font-bold text-green-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
