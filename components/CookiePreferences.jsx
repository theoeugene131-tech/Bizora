"use client";

import { BRAND } from "@/lib/brand";

export default function CookiePreferences() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem(`${BRAND.name.toLowerCase()}-cookie-consent`);
        window.location.reload();
      }}
      className="hover:underline"
    >
      Cookie preferences
    </button>
  );
}
