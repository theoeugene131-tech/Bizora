"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

export default function OwnerDashboard() {
  // See AdminDashboard.jsx for why this must be useState(() => ...) and not
  // a plain getSupabase() call — the latter caused an infinite refetch loop.
  const [supabase] = useState(() => getSupabase());
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("businesses")
      .select("*, products(*)")
      .order("created_at", { ascending: false });
    setBusinesses(data ?? []);
  }, [supabase]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function authSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else
        setNotice(
          "Account created! Check your email to confirm, then log in. Use the SAME email you submitted your listing with."
        );
    }
  }

  if (checking) return <p className="text-center py-16 text-gray-500">Loading…</p>;

  if (!session) {
    return (
      <form onSubmit={authSubmit} className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h1 className="text-xl font-bold">Business owner portal</h1>
        <p className="text-sm text-gray-500">Manage your listing with the email you submitted it with.</p>
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {notice && <p className="text-green-700 text-sm">{notice}</p>}
        <button className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-lg hover:bg-green-800">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-sm text-green-700 hover:underline"
        >
          {mode === "login" ? "First time? Create an account" : "Have an account? Log in"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your listings</h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-600 hover:underline">
          Log out
        </button>
      </div>

      {businesses.length === 0 && (
        <p className="text-sm text-gray-500">
          No listings under this email yet. Submit one via “+ Add Business” using this same email.
        </p>
      )}

      {businesses.map((b) => (
        <OwnerBusinessCard key={b.id} business={b} supabase={supabase} onChanged={load} />
      ))}
    </div>
  );
}

function OwnerBusinessCard({ business, supabase, onChanged }) {
  const [form, setForm] = useState({
    name: business.name,
    description: business.description ?? "",
    phone: business.phone,
    email: business.email ?? "",
    website: business.website ?? "",
    street: business.street ?? "",
    city: business.city,
    state: business.state,
  });
  const [products, setProducts] = useState(business.products ?? []);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("businesses").update(form).eq("id", business.id);
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Saved ✔");
    onChanged();
  }

  async function uploadPhoto(file) {
    setBusy(true);
    try {
      const url = await uploadImage(file, `businesses/${business.slug}-${Date.now()}`);
      const { error } = await supabase.from("businesses").update({ image_url: url }).eq("id", business.id);
      setMsg(error ? error.message : "Photo updated ✔");
      onChanged();
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  async function addProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || !(Number(newProduct.price) > 0)) return;
    const { data, error } = await supabase
      .from("products")
      .insert({ business_id: business.id, name: newProduct.name.trim(), price: Number(newProduct.price) })
      .select()
      .single();
    if (!error) {
      setProducts([...products, data]);
      setNewProduct({ name: "", price: "" });
    }
  }

  async function saveProduct(p) {
    const { error } = await supabase
      .from("products")
      .update({ name: p.name, price: Number(p.price) })
      .eq("id", p.id);
    if (!error) setProducts(products.map((x) => (x.id === p.id ? p : x)));
  }

  async function removeProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{business.name}</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_STYLES[business.status]}`}>
          {business.status}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Business name" />
        <input value={form.phone} onChange={set("phone")} className={inputClass} placeholder="Phone" />
        <input value={form.street} onChange={set("street")} className={inputClass} placeholder="Street" />
        <input value={form.city} onChange={set("city")} className={inputClass} placeholder="City" />
        <input value={form.state} onChange={set("state")} className={inputClass} placeholder="Region" />
        <input value={form.website} onChange={set("website")} className={inputClass} placeholder="Website" />
      </div>
      <textarea value={form.description} onChange={set("description")} rows={2} className={inputClass} placeholder="Description" />

      <label className="inline-block cursor-pointer text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
        📷 Update photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files[0] && uploadPhoto(e.target.files[0])}
        />
      </label>

      <div>
        <p className="text-sm font-semibold mb-2">Products & prices</p>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex gap-2">
              <input
                defaultValue={p.name}
                className={inputClass}
                onBlur={(e) => saveProduct({ ...p, name: e.target.value })}
              />
              <input
                defaultValue={p.price}
                type="number"
                className={`${inputClass} max-w-[120px]`}
                onBlur={(e) => saveProduct({ ...p, price: e.target.value })}
              />
              <button onClick={() => removeProduct(p.id)} className="text-red-500 px-2">
                ✕
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={addProduct} className="flex gap-2 mt-2">
          <input
            placeholder="New product"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Price"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className={`${inputClass} max-w-[120px]`}
          />
          <button className="text-sm bg-green-700 text-white rounded-lg px-3">Add</button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </div>
  );
}
