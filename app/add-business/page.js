import AddBusinessForm from "@/components/AddBusinessForm";
import { getCountry } from "@/lib/countries";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Add your business — ${BRAND.name}` };

export default async function AddBusinessPage({ searchParams }) {
  const sp = await searchParams;
  const country = getCountry(sp?.c);
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Add your business — free {country.flag}</h1>
      <p className="text-gray-600 mt-2 mb-8">
        Listings are free and reviewed before going live (usually within 24 hours).
      </p>
      <AddBusinessForm country={country.code} />
    </div>
  );
}
