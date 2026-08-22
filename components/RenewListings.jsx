"use client";

import { useState } from "react";
import Script from "next/script";
import { formatNaira } from "@/lib/format";
import { BRAND } from "@/lib/brand";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const LISTING_FEE = 5000;
const ALIST_FEE = 10000;

export default function RenewListings() {
  const [phone, setPhone] = useState("");
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings/my-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Something went wrong");
      } else {
        setListings(json.listings);
        if (json.listings.length === 0) setError("No listings found for that phone number.");
      }
    } catch {
      setError("Something went wrong — try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <form onSubmit={lookup} className="flex gap-2 mb-8">
        <input
          required
          placeholder="Enter the phone number you listed with"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <button
          disabled={loading}
          className="bg-green-700 text-white font-semibold px-5 rounded-lg hover:bg-green-800 disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Looking…" : "Find my listings"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {listings && listings.length > 0 && (
        <div className="space-y-4">
          {listings.map((l) => (
            <ListingRow key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </>
  );
}

function ListingRow({ listing }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const paidUntilDate = listing.paid_until ? new Date(listing.paid_until) : null;
  const isExpired = paidUntilDate && paidUntilDate < new Date();
  const isFree = !listing.paid;

  const featuredUntilDate = listing.featured_until ? new Date(listing.featured_until) : null;
  const isAlistActive = listing.is_featured && featuredUntilDate && featuredUntilDate > new Date();

  function pay(amount, plan, apiPath, onSuccess) {
    if (!window.PaystackPop) {
      setMessage("Payment is still loading — try again in a moment.");
      return;
    }
    setStatus("paying");
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: "seller@example.com",
      amount: amount * 100,
      currency: "NGN",
      ref: `${BRAND.payRefPrefix}-${plan.toUpperCase()}-${Date.now()}`,
      callback: async (response) => {
        setStatus("submitting");
        try {
          const res = await fetch(apiPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: listing.slug, paystackReference: response.reference }),
          });
          const json = await res.json();
          setMessage(res.ok ? json.message : `Error: ${json.message}`);
          if (res.ok) onSuccess();
        } catch {
          setMessage("Payment received — check back shortly.");
        }
        setStatus("idle");
      },
      onClose: () => setStatus("idle"),
    });
    handler.openIframe();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        {listing.image_url ? (
          <img src={listing.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-gray-100" />
        )}
        <div className="flex-1">
          <p className="font-semibold">{listing.title}</p>
          <p className="text-xs text-gray-500">
            {listing.status === "pending" ? "⏳ Pending review" : "🟢 Live"}
            {isFree && " · Free listing"}
            {!isFree && paidUntilDate && (isExpired ? " · ⚠️ Expired — renew to go live again" : ` · Paid until ${paidUntilDate.toLocaleDateString()}`)}
            {isAlistActive && ` · 🅰 A-List until ${featuredUntilDate.toLocaleDateString()}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {!isFree && (
          <button
            disabled={status !== "idle"}
            onClick={() => pay(LISTING_FEE, "renew", "/api/listings/renew", () => {})}
            className="bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-60"
          >
            {isExpired ? `Renew now — ${formatNaira(LISTING_FEE)}/mo` : `Renew early — ${formatNaira(LISTING_FEE)}/mo`}
          </button>
        )}
        {!isAlistActive && (
          <button
            disabled={status !== "idle"}
            onClick={() => pay(ALIST_FEE, "alist", "/api/listings/alist", () => {})}
            className="bg-purple-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-800 disabled:opacity-60"
          >
            🅰 Go A-List — {formatNaira(ALIST_FEE)}/mo
          </button>
        )}
        <a href={`/listing/${listing.slug}`} target="_blank" className="text-sm text-green-700 hover:underline self-center">
          View
        </a>
      </div>

      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
}
