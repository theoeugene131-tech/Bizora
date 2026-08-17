import Link from "next/link";
import { BRAND } from "@/lib/brand";
import CookiePreferences from "./CookiePreferences";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between gap-3">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}
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
    </footer>
  );
}
