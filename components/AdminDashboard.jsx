"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { formatNaira } from "@/lib/format";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

export default function AdminDashboard() {
  const supabase = getSupabase();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState("");

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
    const [{ data: biz }, { data: pays }] = await Promise.all([
      supabase.from("businesses").select("*, products(*)").order("created_at", { ascending: false }),
      supabase.from("payments").select("*"),
    ]);
    setBusinesses(biz ?? []);
    setPayments(pays ?? []);
  }, [supabase]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function adminCall(path, body) {
    setBusy(path + body.slug);
    const { data } = await supabase.auth.getSession();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    setBusy("");
    if (!res.ok) alert((await res.json()).message ?? "Something went wrong");
    else load();
  }

  async function login(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginError(error?.message ?? "");
  }

  async function uploadFor(slug, file) {
    setBusy(slug);
    try {
      const url = await uploadImage(file, `businesses/${slug}-${Date.now()}`);
      await adminCall("/api/admin/update", { slug, imageUrl: url });
    } catch (err) {
      alert(err.message);
      setBusy("");
    }
  }

  if (checking) return <p className="text-center py-16 text-gray-500">Loading…</p>;

  if (!session) {
    return (
      <form onSubmit={login} className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold">Admin login</h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
        <button className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-lg hover:bg-green-800">
          Sign in
        </button>
      </form>
    );
  }

  const pending = businesses.filter((b) => b.status === "pending");
  const approved = businesses.filter((b) => b.status === "approved");
  const revenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

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
        <Stat label="Featured" value={approved.filter((b) => b.is_featured).length} />
        <Stat label="Revenue" value={formatNaira(revenue)} />
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">⏳ Pending review ({pending.length})</h2>
        {pending.length === 0 && <p className="text-sm text-gray-500">Nothing waiting. 🎉</p>}
        <div className="space-y-4">
          {pending.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {b.image_url && <img src={b.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-green-700 font-medium">
                    {b.category} · 📍 {b.city}, {b.state}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{b.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    📞 {b.phone} · ✉️ {b.submitter_email}
                    {b.lat != null && (
                      <a
                        className="text-green-700 ml-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}
                      >
                        View pinned location →
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  disabled={!!busy}
                  onClick={() => adminCall("/api/admin/update", { slug: b.slug, status: "approved" })}
                  className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  ✔ Approve
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => adminCall("/api/admin/update", { slug: b.slug, status: "rejected" })}
                  className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">🟢 Live businesses ({approved.length})</h2>
        <div className="space-y-3">
          {approved.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3"
            >
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
                onClick={() => adminCall("/api/admin/update", { slug: b.slug, featured: !b.is_featured })}
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
                  adminCall("/api/admin/delete", { slug: b.slug })
                }
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      {busy && <p className="text-sm text-gray-500">Working…</p>}
    </div>
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
