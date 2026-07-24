import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { getReportMetrics } from "@/server/db/queries/reports";
import { getHotelSettings } from "@/server/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsView } from "./reports-view";

export const metadata: Metadata = { title: "Reports" };

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireRole(["admin"]);
  const { start, end } = await searchParams;

  const startDate = start || firstOfMonth();
  // Report window is exclusive of `end` — bump one day forward so a
  // same-day range still covers "today" fully instead of zero days.
  const endDate = end || todayISO();
  const inclusiveEnd = new Date(endDate);
  inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
  const endDateExclusive = inclusiveEnd.toISOString().slice(0, 10);

  const [metrics, settings] = await Promise.all([
    getReportMetrics(startDate, endDateExclusive),
    getHotelSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Occupancy and reservation revenue for the selected period." />
      <ReportsView metrics={metrics} currency={settings.currency} startDate={startDate} endDate={endDate} />
    </div>
  );
}