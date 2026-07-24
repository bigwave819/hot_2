"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "./revenue-chart";
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_VARIANT } from "@/lib/reservation-status";
import type { ReportMetrics } from "@/server/db/queries/reports";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
      <p className="font-display mt-2 text-2xl font-medium text-foreground">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

export function ReportsView({
  metrics,
  currency,
  startDate,
  endDate,
}: {
  metrics: ReportMetrics;
  currency: string;
  startDate: string;
  endDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function applyRange(start: string, end: string) {
    router.push(`${pathname}?start=${start}&end=${end}`);
  }

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    applyRange(toISO(start), toISO(end));
  }

  function applyThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    applyRange(toISO(start), toISO(now));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Date range controls */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-start" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="report-start"
              type="date"
              defaultValue={startDate}
              max={endDate}
              onChange={(e) => applyRange(e.target.value, endDate)}
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-end" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="report-end"
              type="date"
              defaultValue={endDate}
              min={startDate}
              max={toISO(new Date())}
              onChange={(e) => applyRange(startDate, e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => applyPreset(7)}>
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" onClick={applyThisMonth}>
            This Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyPreset(30)}>
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Occupancy" value={`${metrics.occupancyRate.toFixed(0)}%`} sublabel={`${metrics.occupiedRoomNights} of ${metrics.totalRoomNights} room-nights`} />
        <KpiCard
          label="Reservation Revenue"
          value={`${currency} ${Math.round(metrics.revenue).toLocaleString()}`}
          sublabel="Booked, not necessarily collected"
        />
        <KpiCard label="Avg. Nightly Rate" value={`${currency} ${Math.round(metrics.averageNightlyRate).toLocaleString()}`} />
        <KpiCard label="Arrivals" value={String(metrics.totalReservations)} sublabel="Reservations starting in period" />
        <KpiCard label="Cancellation Rate" value={`${metrics.cancellationRate.toFixed(0)}%`} />
      </div>

      {/* Revenue trend */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-lg font-medium text-foreground">Revenue Trend</h2>
        <div className="mt-4">
          <RevenueChart data={metrics.dailyRevenue} currency={currency} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-medium text-foreground">Arrivals by Status</h2>
          <div className="mt-4 flex flex-col gap-3">
            {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge variant={RESERVATION_STATUS_VARIANT[status as keyof typeof RESERVATION_STATUS_VARIANT]}>
                  {RESERVATION_STATUS_LABEL[status as keyof typeof RESERVATION_STATUS_LABEL]}
                </Badge>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by room type */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-medium text-foreground">Revenue by Room Type</h2>
          {metrics.revenueByRoomType.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No revenue in this period yet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {metrics.revenueByRoomType
                .sort((a, b) => b.revenue - a.revenue)
                .map((row) => (
                  <div key={row.roomTypeName} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.roomTypeName}</span>
                    <span className="font-medium text-foreground">
                      {currency} {Math.round(row.revenue).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}