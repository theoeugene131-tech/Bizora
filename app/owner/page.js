import OwnerDashboard from "@/components/OwnerDashboard";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Owner portal — ${BRAND.name}`, robots: { index: false } };

export default function OwnerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <OwnerDashboard />
    </div>
  );
}
