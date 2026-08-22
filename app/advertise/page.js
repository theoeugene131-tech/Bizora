import { BRAND } from "@/lib/brand";
import AdvertForm from "@/components/AdvertForm";

const plans = [
  {
    name: "Featured Business",
    price: "₦5,000/month",
    perks: ["Appears first in the directory", "★ Featured badge", "Highlighted business card"],
    href: "/add-business",
    cta: "Add your business",
  },
  {
    name: "A-List Product",
    price: "₦10,000/month",
    perks: ["Top placement in marketplace search", "🅰 A-List badge", "Most visibility for a single product"],
    href: "/sell",
    cta: "List a product",
  },
  {
    name: "Banner Ad",
    price: "₦20,000/month",
    perks: ["Rotating banner on the homepage", "Link to your business, product or site", "Seen by every visitor"],
    href: "#banner-ad-form",
    cta: "Buy this ad slot",
  },
];

export const metadata = { title: `Advertise — ${BRAND.name}` };

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Advertise on {BRAND.name}</h1>
      <p className="mt-3 text-gray-600">
        Reach thousands of people searching for products and services every day.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Advertisers are solely responsible for their ad content and its compliance with applicable
        advertising regulations (e.g. ARCON in Nigeria). See our{" "}
        <a href="/terms" className="text-green-700 underline">
          Terms & Disclaimer
        </a>
        .
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
            <h2 className="font-bold text-lg">{p.name}</h2>
            <p className="text-green-700 font-bold text-2xl mt-1">{p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
              {p.perks.map((perk) => (
                <li key={perk}>✔ {perk}</li>
              ))}
            </ul>
            <a
              href={p.href}
              className="mt-5 inline-block text-center bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800"
            >
              {p.cta}
            </a>
          </div>
        ))}
      </div>

      <div id="banner-ad-form" className="mt-12 scroll-mt-8">
        <h2 className="text-xl font-bold mb-4">Buy the homepage banner ad slot</h2>
        <AdvertForm />
      </div>
    </div>
  );
}
