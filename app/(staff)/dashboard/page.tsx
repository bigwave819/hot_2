import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireRole(["receptionist", "admin"]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={
          user.role === "admin"
            ? "Hotel-wide overview and management."
            : "Today's arrivals, departures, and room status."
        }
      />
      <p className="text-sm text-muted-foreground">
        Overview widgets (occupancy, today&apos;s arrivals/departures, revenue) land here once the
        booking flow exists to generate real data.
      </p>
    </div>
  );
}