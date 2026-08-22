import RenewListings from "@/components/RenewListings";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Renew or upgrade a listing — ${BRAND.name}` };

export default function RenewPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Manage your listings</h1>
      <p className="text-gray-600 mt-2 mb-8">
        Enter the phone number you used when posting to renew a paid listing or upgrade it to A-List.
      </p>
      <RenewListings />
    </div>
  );
}
