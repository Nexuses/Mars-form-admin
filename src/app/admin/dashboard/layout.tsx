import { requireAdminPage } from "@/lib/admin-guard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Auth + Mongo data need the incoming request; allow blocking navigation.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <div className="dash-frame">
      <AdminSidebar adminName={session.name} adminEmail={session.email} />
      <div className="dash-content">
        <div className="dash-content-in">{children}</div>
      </div>
    </div>
  );
}
