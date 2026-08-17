"use client";

import { useState } from "react";
import PlacePicker from "./PlacePicker";
import PayButton from "./PayButton";
import { categories } from "@/data/categories";
import { getCountry } from "@/lib/countries";
import { uploadImage } from "@/lib/upload";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

export default function AddBusinessForm({ country: countryCode }) {
  const country = getCountry(countryCode);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    street: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    submitter_email: "",
  });
  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [place, setPlace] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setProduct = (i, key) => (e) => {
    const next = [...products];
    next[i] = { ...next[i], [key]: e.target.value };
    setProducts(next);
  };

  async function submit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      let image_url = null;
      if (photo) {
        image_url = await uploadImage(photo, `submissions/${Date.now()}-${photo.name}`);
      }
      const res = await fetch("/api/submit-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, place, products, image_url, agreed, country: country.code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(json.message ?? "Something went wrong");
        return;
      }
      setStatus("done");
      setResult(json);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (status === "done" && result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-green-800">🎉 Submission received!</h2>
        <p className="text-gray-600 mt-2">
          Your listing is pending review and will appear in the directory once approved.
        </p>
        <div className="mt-6">
          <p className="font-semibold mb-2">Want to be ★ Featured the moment you go live?</p>
          <PayButton
            amount={5000}
            label="Pay ₦5,000 — 1 month Featured"
            businessSlug={result.slug}
            email={form.submitter_email || form.email || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Business name *" value={form.name} onChange={set("name")} className={inputClass} />
        <select required value={form.category} onChange={set("category")} className={inputClass}>
          <option value="">Select category *</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Describe your business..."
        rows={3}
        value={form.description}
        onChange={set("description")}
        className={inputClass}
      />

      <div>
        <p className="text-sm font-medium mb-1">
          Pin your location on Google Maps (optional but recommended)
        </p>
        <PlacePicker onSelect={setPlace} countryCode={country.code} />
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Business photo (optional, max 2MB)</p>
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => setPhoto(e.target.files[0] ?? null)}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <input placeholder="Street address" value={form.street} onChange={set("street")} className={inputClass} />
        <input required placeholder="City *" value={form.city} onChange={set("city")} className={inputClass} />
        <select required value={form.state} onChange={set("state")} className={inputClass}>
          <option value="">Region *</option>
          {country.regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Phone (e.g. +234 801 234 5678) *"
          value={form.phone}
          onChange={set("phone")}
          className={inputClass}
        />
        <input type="email" placeholder="Business email" value={form.email} onChange={set("email")} className={inputClass} />
        <input placeholder="Website (optional)" value={form.website} onChange={set("website")} className={inputClass} />
        <input
          required
          type="email"
          placeholder="Your email (for updates) *"
          value={form.submitter_email}
          onChange={set("submitter_email")}
          className={inputClass}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Products / services (optional)</p>
        {products.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input placeholder="Product name" value={p.name} onChange={setProduct(i, "name")} className={inputClass} />
            <input
              placeholder="Price"
              type="number"
              min="0"
              value={p.price}
              onChange={setProduct(i, "price")}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setProducts(products.filter((_, j) => j !== i))}
              className="text-red-500 px-2"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProducts([...products, { name: "", price: "" }])}
          className="text-sm text-green-700 font-medium"
        >
          + Add another product
        </button>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          I confirm I am authorised to list this business and that the information provided is
          accurate. I understand that my business is <strong>solely responsible</strong> for the
          quality, safety and legality of all products and services advertised, and for{" "}
          <strong>ensuring receipt of payment</strong> from my customers, per the{" "}
          <a href="/terms" target="_blank" className="text-green-700 underline">
            Terms & Disclaimer
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" className="text-green-700 underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit business (free)"}
      </button>
    </form>
  );
}
