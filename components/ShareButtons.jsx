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
    <div className="bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
      <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">📤 Share this:</span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1.5"
        aria-label="Share on WhatsApp"
      >
        <span>💬</span> WhatsApp
      </a>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
        aria-label="Share on Facebook"
      >
        Facebook
      </a>
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-800 shadow-sm"
        aria-label="Share on X"
      >
        X
      </a>
      <button
        onClick={copyLink}
        className="bg-white border-2 border-gray-300 text-gray-800 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
      >
        {copied ? "✔ Copied!" : "🔗 Copy link"}
      </button>
      {canNativeShare && (
        <button
          onClick={nativeShare}
          className="bg-white border-2 border-gray-300 text-gray-800 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          📱 More…
        </button>
      )}
    </div>
  );
}
