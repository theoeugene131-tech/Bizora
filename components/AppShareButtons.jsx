"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bizora-vert.vercel.app";
const APP_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
const APP_TEXT = `${BRAND.name}: ${BRAND.tagline} Owned by ${BRAND.owner}.`;

export default function AppShareButtons({ variant = "hero" }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const url = SITE_URL;
  useEffect(() => { if (typeof navigator !== "undefined" && navigator.share) setCanNativeShare(true); }, []);

  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000);} catch {}
  }
  async function nativeShare(){ try{ await navigator.share({ title: APP_TITLE, text: APP_TEXT, url }); } catch{} }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${APP_TITLE} ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(APP_TITLE)}&url=${encodeURIComponent(url)}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(APP_TITLE)}`;

  if (variant === "header") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="hidden lg:inline text-xs text-green-100 mr-1">Share app:</span>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Share Bizora on WhatsApp" className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg text-xs">💬</a>
        <a href={facebookHref} target="_blank" rel="noopener noreferrer" aria-label="Share Bizora on Facebook" className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg text-xs">f</a>
        <a href={twitterHref} target="_blank" rel="noopener noreferrer" aria-label="Share Bizora on X" className="bg-black hover:bg-gray-800 text-white p-1.5 rounded-lg text-xs">𝕏</a>
        <button onClick={copyLink} aria-label="Copy Bizora link" className="bg-white text-green-700 p-1.5 rounded-lg text-xs hover:bg-green-50">{copied?"✔":"🔗"}</button>
        {canNativeShare && <button onClick={nativeShare} className="bg-white text-green-700 p-1.5 rounded-lg text-xs">📱</button>}
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white/10 backdrop-blur border-2 border-yellow-300 rounded-xl p-4 flex flex-wrap items-center justify-center gap-3 shadow-lg">
      <span className="text-sm font-bold text-yellow-200 flex items-center gap-1.5">📤 Share Bizora app:</span>
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-600 shadow flex items-center gap-1.5">💬 WhatsApp</a>
      <a href={facebookHref} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 shadow">Facebook</a>
      <a href={twitterHref} target="_blank" rel="noopener noreferrer" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-800 shadow">X</a>
      <a href={linkedInHref} target="_blank" rel="noopener noreferrer" className="bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-800 shadow hidden sm:inline-flex">LinkedIn</a>
      <a href={telegramHref} target="_blank" rel="noopener noreferrer" className="bg-sky-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-sky-600 shadow hidden sm:inline-flex">Telegram</a>
      <button onClick={copyLink} className="bg-white text-green-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-50 shadow">{copied?"✔ Copied!":"🔗 Copy link"}</button>
      {canNativeShare && <button onClick={nativeShare} className="bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 shadow">📱 More…</button>}
    </div>
  );
}
