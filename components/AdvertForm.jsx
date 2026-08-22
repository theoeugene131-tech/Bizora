"use client";

import { useState } from "react";
import Script from "next/script";
import { BANNER_AD_FEE } from "@/lib/ads";
import { BRAND } from "@/lib/brand";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600";

const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function AdvertForm() {
  const [form, setForm] = useState({
    title: "",
    text: "",
    cta: "Learn more",
    link: "",
    advertiser_name: "",
    advertiser_email: "",
    advertiser_phone: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submitAd(paystackReference) {
    const res = await fetch("/api/ads/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, agreed, paystackReference }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(json.message ?? "Something went wrong");
      return;
    }
    setStatus("idle");
    setDone(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!window.PaystackPop) {
      setError("Payment is still loading — try again in a moment.");
      return;
    }
    setStatus("paying");
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: form.advertiser_email || "advertiser@example.com",
      amount: BANNER_AD_FEE * 100,
      currency: "NGN",
      ref: `${BRAND.payRefPrefix}-BANNERAD-${Date.now()}`,
      callback: async (response) => {
        setStatus("submitting");
        await submitAd(response.reference);
      },
      onClose: () => setStatus("idle"),
    });
    handler.openIframe();
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-green-800">🎉 Ad submitted!</h3>
        <p className="text-gray-600 mt-2">
          It'll appear on the homepage banner once reviewed (usually within 24 hours), and run for 30 days.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg">Buy homepage banner ad — ₦{BANNER_AD_FEE.toLocaleString()}/month</h3>

        <input required placeholder="Ad title *" value={form.title} onChange={set("title")} className={inputClass} />
        <textarea
          required
          placeholder="Ad text (one short sentence) *"
          rows={2}
          value={form.text}
          onChange={set("text")}
          className={inputClass}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Button text (e.g. Shop now)" value={form.cta} onChange={set("cta")} className={inputClass} />
          <input
            required
            type="url"
            placeholder="Link when clicked (your listing/business/site URL) *"
            value={form.link}
            onChange={set("link")}
            className={inputClass}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <input placeholder="Your name" value={form.advertiser_name} onChange={set("advertiser_name")} className={inputClass} />
          <input
            type="email"
            placeholder="Email"
            value={form.advertiser_email}
            onChange={set("advertiser_email")}
            className={inputClass}
          />
          <input placeholder="Phone" value={form.advertiser_phone} onChange={set("advertiser_phone")} className={inputClass} />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          <span>
            I confirm I'm authorised to run this ad and am solely responsible for its content and accuracy, per the{" "}
            <a href="/terms" target="_blank" className="text-green-700 underline">
              Terms & Disclaimer
            </a>
            .
          </span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status !== "idle"}
          className="bg-green-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 disabled:opacity-60"
        >
          {status === "paying"
            ? "Opening payment…"
            : status === "submitting"
            ? "Submitting…"
            : `Pay ₦${BANNER_AD_FEE.toLocaleString()} & Submit Ad`}
        </button>
      </form>
    </>
  );
}
