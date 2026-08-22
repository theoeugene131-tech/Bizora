"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Checked after mount (not during render) so the server-rendered HTML and
  // the client's first render match exactly — avoids a hydration mismatch.
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) setCanNativeShare(true);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail on older browsers — the other share buttons
      // below still work regardless, so we just ignore this quietly.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // User cancelled the share sheet — nothing to do.
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600"
      >
        WhatsApp
      </a>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700"
      >
        Facebook
      </a>
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-800"
      >
        X
      </a>
      <button
        onClick={copyLink}
        className="border border-gray-300 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50"
      >
        {copied ? "✔ Copied!" : "Copy link"}
      </button>
      {canNativeShare && (
        <button
          onClick={nativeShare}
          className="border border-gray-300 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          More…
        </button>
      )}
    </div>
  );
}
