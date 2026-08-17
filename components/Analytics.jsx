"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const KEY = `${BRAND.name.toLowerCase()}-cookie-consent`;

export default function Analytics() {
  const [consent, setConsent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(localStorage.getItem(KEY));
    setReady(true);
  }, []);

  function choose(value) {
    localStorage.setItem(KEY, value);
    setConsent(value);
  }

  if (!ready) return null;

  return (
    <>
      {consent === null && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50">
          <p className="text-sm text-gray-700">
            🍪 We use cookies to keep you logged in and — only with your permission — Google
            Analytics to understand how the site is used.{" "}
            <a href="/privacy" className="text-green-700 underline">
              Privacy Policy
            </a>
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => choose("yes")}
              className="flex-1 bg-green-700 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-800"
            >
              Accept
            </button>
            <button
              onClick={() => choose("no")}
              className="flex-1 border border-gray-300 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {consent === "yes" && process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
