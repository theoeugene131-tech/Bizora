import { BRAND } from "@/lib/brand";

export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-xl font-bold text-white">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#ffffff" />
        <text
          x="30"
          y="45"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="38"
          fontWeight="bold"
          fill="#15803d"
          textAnchor="middle"
        >
          B
        </text>
        <circle cx="47" cy="17" r="7" fill="#f97316" />
      </svg>
      {BRAND.name}
    </span>
  );
}
