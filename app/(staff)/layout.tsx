import { requireRole } from "@/server/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["receptionist", "admin"]);
  return <DashboardShell user={user}>{children}</DashboardShell>;
}