import AdminDashboard from "@/components/AdminDashboard";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Admin — ${BRAND.name}`, robots: { index: false } };

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <AdminDashboard />
    </div>
  );
}
