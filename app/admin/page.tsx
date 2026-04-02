import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminAccess } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (!access.demoMode && !access.user) {
    redirect("/admin/login");
  }

  const data = await getAdminDashboardData();

  return (
    <AdminDashboard
      neighborhoods={data.neighborhoods}
      votes={data.votes}
      demoMode={access.demoMode}
      adminEmail={access.user?.email}
    />
  );
}
