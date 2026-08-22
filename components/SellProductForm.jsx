"use client";

import { useState } from "react";
import Script from "next/script";
import { productCategories } from "@/data/product-categories";
import { getCountry } from "@/lib/countries";
import { uploadImage } from "@/lib/upload";
import { BRAND } from "@/lib/brand";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function SellProductForm({ country: countryCode }) {
  const country = getCountry(countryCode);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    condition: "used",
    city: "",
    state: "",
    seller_name: "",
    seller_phone: "",
    seller_email: "",
  });
  const [photo, setPhoto] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [quota, setQuota] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function checkQuota(phone) {
    if (!phone?.trim()) return;
    try {
      const res = await fetch("/api/listings/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) setQuota(await res.json());
    } catch {
      // Quota is re-checked server-side on submit regardless, so a failed
      // client-side pre-check here isn't fatal.
    }
  }

  async function submitListing(paystackReference) {
    let image_url = null;
    try {
      if (photo) {
        image_url = await uploadImage(photo, `listings/${Date.now()}-${photo.name}`);
      }
    } catch (err) {
      setStatus("error");
      setError(`Photo upload failed: ${err.message}`);
      return;
    }

    const res = await fetch("/api/listings/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image_url, agreed, country: country.code, paystackReference }),
    });
    const json = await res.json();

    if (!res.ok) {
      if (res.status === 402) {
        setQuota({ requiresPayment: true, fee: json.fee, freeRemaining: 0 });
        setStatus("idle");
        return;
      }
      setStatus("error");
      setError(json.message ?? "Something went wrong");
      return;
    }
    setStatus("done");
    setResult(json);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (quota?.requiresPayment) {
      if (!window.PaystackPop) {
        setError("Payment is still loading — try again in a moment.");
        return;
      }
      setStatus("paying");
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: form.seller_email || "seller@example.com",
        amount: quota.fee * 100,
        currency: "NGN",
        ref: `${BRAND.payRefPrefix}-LISTING-${Date.now()}`,
        callback: async (response) => {
          setStatus("submitting");
          await submitListing(response.reference);
        },
        onClose: () => setStatus("idle"),
      });
      handler.openIframe();
      return;
    }

    setStatus("submitting");
    await submitListing(null);
  }

  if (status === "done" && result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-green-800">🎉 Your product is listed!</h2>
        <p className="text-gray-600 mt-2">
          It's pending review and will be visible to buyers once approved (usually within 24 hours).
        </p>
        <div className="mt-6 pt-6 border-t border-green-200">
          <p className="font-semibold mb-2">Want it to stand out from the crowd?</p>
          <AlistUpsell slug={result.slug} email={form.seller_email} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="Product title (e.g. iPhone 13 Pro Max 256GB) *"
            value={form.title}
            onChange={set("title")}
            className={inputClass}
          />
          <select required value={form.category} onChange={set("category")} className={inputClass}>
            <option value="">Select category *</option>
            {productCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            type="number"
            min="0"
            placeholder={`Price (${country.currency.symbol.trim()}) *`}
            value={form.price}
            onChange={set("price")}
            className={inputClass}
          />
          <select value={form.condition} onChange={set("condition")} className={inputClass}>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>

        <textarea
          placeholder="Describe your product — brand, specs, any defects..."
          rows={3}
          value={form.description}
          onChange={set("description")}
          className={inputClass}
        />

        <div>
          <p className="text-sm font-medium mb-1">Product photo *</p>
          <input
            required
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => setPhoto(e.target.files[0] ?? null)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input required placeholder="City *" value={form.city} onChange={set("city")} className={inputClass} />
          <select required value={form.state} onChange={set("state")} className={inputClass}>
            <option value="">Region *</option>
            {country.regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Your name" value={form.seller_name} onChange={set("seller_name")} className={inputClass} />
          <input
            required
            placeholder="Your phone number (buyers will call/WhatsApp you) *"
            value={form.seller_phone}
            onChange={set("seller_phone")}
            onBlur={(e) => checkQuota(e.target.value)}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.seller_email}
            onChange={set("seller_email")}
            className={inputClass}
          />
        </div>

        {quota && (
          <p className={`text-sm font-medium ${quota.requiresPayment ? "text-orange-600" : "text-green-700"}`}>
            {quota.requiresPayment
              ? `You've used your free listings — this one costs ₦${quota.fee?.toLocaleString()}.`
              : `✔ You have ${quota.freeRemaining} free listing(s) left.`}
          </p>
        )}

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          <span>
            I confirm this is my product to sell and the information is accurate. I understand I am{" "}
            <strong>solely responsible</strong> for the quality, safety and legality of this product, and for{" "}
            <strong>ensuring receipt of payment</strong> from buyers, per the{" "}
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
          disabled={status === "submitting" || status === "paying"}
          className="bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 disabled:opacity-60"
        >
          {status === "paying"
            ? "Opening payment…"
            : status === "submitting"
            ? "Submitting…"
            : quota?.requiresPayment
            ? `Pay ₦${quota.fee?.toLocaleString()} & List Product`
            : "List Product (Free)"}
        </button>
      </form>
    </>
  );
}

const ALIST_FEE = 10000;

function AlistUpsell({ slug, email }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function purchase() {
    if (!window.PaystackPop) {
      setMessage("Payment is still loading — try again in a moment.");
      return;
    }
    setStatus("paying");
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: email || "seller@example.com",
      amount: ALIST_FEE * 100,
      currency: "NGN",
      ref: `${BRAND.payRefPrefix}-ALIST-${Date.now()}`,
      callback: async (response) => {
        setStatus("submitting");
        try {
          const res = await fetch("/api/listings/alist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, paystackReference: response.reference }),
          });
          const json = await res.json();
          setMessage(res.ok ? json.message : `Error: ${json.message}`);
        } catch {
          setMessage("Payment received — activation may take a moment.");
        }
        setStatus("idle");
      },
      onClose: () => setStatus("idle"),
    });
    handler.openIframe();
  }

  return (
    <div>
      <button
        onClick={purchase}
        disabled={status !== "idle"}
        className="bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-purple-800 disabled:opacity-60"
      >
        {status === "paying" ? "Opening payment…" : status === "submitting" ? "Activating…" : `🅰 Go A-List — ₦${ALIST_FEE.toLocaleString()}/month`}
      </button>
      <p className="text-xs text-gray-500 mt-2">Top placement in search results for 30 days.</p>
      {message && <p className="text-sm text-green-700 mt-2">{message}</p>}
    </div>
  );
}
