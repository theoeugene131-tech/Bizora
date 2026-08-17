import { BRAND } from "@/lib/brand";

const plans = [
  {
    name: "Featured Listing",
    price: "₦5,000/month",
    perks: ["Appears first in search results", "★ Featured badge", "Highlighted business card"],
  },
  {
    name: "Banner Ad",
    price: "₦20,000/month",
    perks: ["Rotating banner on homepage", "Link to your business or site", "Seen by every visitor"],
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
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg">{p.name}</h2>
            <p className="text-green-700 font-bold text-2xl mt-1">{p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {p.perks.map((perk) => (
                <li key={perk}>✔ {perk}</li>
              ))}
            </ul>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="mt-5 inline-block bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800"
            >
              Get started
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
