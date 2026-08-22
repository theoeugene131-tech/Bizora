"use client";

import { useEffect, useState } from "react";
import { ads as staticAds } from "@/data/ads";

export default function AdBanner({ ads: paidAds }) {
  const ads = paidAds && paidAds.length > 0 ? paidAds : staticAds;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0); // reset if the ad list itself changes (e.g. between country switches)
    if (ads.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ads.length), 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return null;
  const ad = ads[index % ads.length];

  return (
    <div className="max-w-6xl mx-auto px-4 mt-6">
      <div
        className={`${ad.bgColor} rounded-xl text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      >
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">Sponsored</p>
          <h3 className="font-bold text-lg">{ad.title}</h3>
          <p className="text-sm opacity-90">{ad.text}</p>
        </div>
        <a
          href={ad.link}
          className="bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg whitespace-nowrap hover:bg-gray-100"
        >
          {ad.cta}
        </a>
      </div>
    </div>
  );
}
