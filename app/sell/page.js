import SellProductForm from "@/components/SellProductForm";
import { getCountry } from "@/lib/countries";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Sell a product — ${BRAND.name}` };

export default async function SellPage({ searchParams }) {
  const sp = await searchParams;
  const country = getCountry(sp?.c);
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Sell your product {country.flag}</h1>
      <p className="text-gray-600 mt-2 mb-8">
        Your first 3 listings are free. After that, it's just ₦5,000 per product to reach buyers across{" "}
        {country.label}.
      </p>
      <SellProductForm country={country.code} />
    </div>
  );
}
