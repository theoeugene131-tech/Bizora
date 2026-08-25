import Link from "next/link";
import { Suspense } from "react";
import Logo from "./Logo";
import CountrySwitcher from "./CountrySwitcher";
import AppShareButtons from "./AppShareButtons";

export default function Header() {
  return (
    <header className="bg-green-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
          <Suspense fallback={null}>
            <CountrySwitcher />
          </Suspense>
          <AppShareButtons variant="header" />
          <Link href="/marketplace" className="hover:underline">
            Marketplace
          </Link>
          <Link href="/add-business" className="hover:underline hidden sm:inline">
            Add Business
          </Link>
          <Link
            href="/sell"
            className="bg-white text-green-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50"
          >
            + Sell a Product
          </Link>
        </nav>
      </div>
    </header>
  );
}
