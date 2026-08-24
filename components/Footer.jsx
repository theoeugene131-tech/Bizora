import Link from "next/link";
import { BRAND } from "@/lib/brand";
import CookiePreferences from "./CookiePreferences";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline} Owned and managed by {BRAND.owner}.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/owner" className="hover:underline">
              Owner portal
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Disclaimer
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <CookiePreferences />
            <a href={`mailto:${BRAND.supportEmail}`} className="hover:underline">
              {BRAND.supportEmail}
            </a>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">
          Contact via WhatsApp:{" "}
          <a href={BRAND.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
            {BRAND.whatsapp}
          </a>{" "}
          · Nigeria payments: {BRAND.bank.name} Ac {BRAND.bank.account} ({BRAND.bank.holder})
        </p>
      </div>
    </footer>
  );
}
