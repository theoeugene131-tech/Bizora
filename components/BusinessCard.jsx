import Link from "next/link";
import { formatMoney } from "@/lib/format";

const COLORS = ["bg-green-600", "bg-orange-500", "bg-blue-600", "bg-purple-600", "bg-rose-600"];

export default function BusinessCard({ business, index = 0, currency }) {
  const color = COLORS[index % COLORS.length];
  const initials = business.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/business/${business.slug}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {business.image_url ? (
        <img
          src={business.image_url}
          alt={business.name}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div
          className={`h-36 ${color} flex items-center justify-center text-white text-4xl font-bold`}
        >
          {initials}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{business.name}</h3>
          {business.featured && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
              ★ Featured
            </span>
          )}
        </div>
        <p className="text-xs text-green-700 font-medium mt-0.5">{business.category}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{business.description}</p>
        <p className="text-sm text-gray-600 mt-2">
          📍 {business.city}, {business.state}
        </p>
        {business.products?.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            From {formatMoney(Math.min(...business.products.map((p) => Number(p.price))), currency)}
          </p>
        )}
      </div>
    </Link>
  );
}
