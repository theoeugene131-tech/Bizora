"use client";

import Script from "next/script";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function PayButton({ amount, label, businessSlug, email = "customer@example.com" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const pay = () => {
    if (!window.PaystackPop) {
      return setMessage("Payments still loading — try again in a few seconds.");
    }
    const handler = window.PaystackPop.setup({
      key: KEY,
      email,
      amount: amount * 100,
      currency: "NGN",
      ref: `${BRAND.payRefPrefix}-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: "Business", variable_name: "business_slug", value: businessSlug ?? "" },
        ],
      },
      callback: async (response) => {
        setBusy(true);
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });
          const json = await res.json();
          setMessage(json.message);
        } catch {
          setMessage("Payment received — activation may take a moment.");
        } finally {
          setBusy(false);
        }
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <button
        onClick={pay}
        disabled={busy}
        className="bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-60"
      >
        {busy ? "Verifying..." : label}
      </button>
      {message && <p className="text-sm text-green-700 mt-2">{message}</p>}
    </>
  );
}
