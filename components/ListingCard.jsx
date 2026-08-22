import Link from "next/link";
import { formatMoney } from "@/lib/format";

export default function ListingCard({ listing, currency }) {
  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {listing.image_url ? (
        <img src={listing.image_url} alt={listing.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl">🛍️</div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{listing.title}</h3>
          {listing.is_featured && (
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
              A-LIST
            </span>
          )}
        </div>
        <p className="text-green-700 font-bold mt-1">{formatMoney(Number(listing.price), currency)}</p>
        <p className="text-xs text-gray-500 mt-1 capitalize">
          {listing.condition} · {listing.city}, {listing.state}
        </p>
      </div>
    </Link>
  );
}
