import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { AlertCircle, LogIn, LogOut, TrendingUp, Images, UtensilsCrossed, FileText, UserCog } from "lucide-react";
import { requireRole } from "@/server/auth/session";
import {
  getTodaysArrivals,
  getTodaysDepartures,
  getPendingReservationsCount,
  getRoomStatusCounts,
} from "@/server/db/queries/dashboard";
import { getReportMetrics } from "@/server/db/queries/reports";
import { getHotelSettings } from "@/server/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_LABEL, ROOM_STATUS_VARIANT, type RoomStatus } from "@/lib/room-status";

export const metadata: Metadata = { title: "Dashboard" };

const ROOM_STATUS_ORDER: RoomStatus[] = ["available", "reserved", "occupied", "cleaning", "maintenance"];

export default async function DashboardPage() {
  const user = await requireRole(["receptionist", "admin"]);

  const [arrivals, departures, pendingCount, roomStatusCounts] = await Promise.all([
    getTodaysArrivals(),
    getTodaysDepartures(),
    getPendingReservationsCount(),
    getRoomStatusCounts(),
  ]);

  let monthlyMetrics: Awaited<ReturnType<typeof getReportMetrics>> | null = null;
  let currency = "RWF";
  if (user.role === "admin") {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [metrics, settings] = await Promise.all([
      getReportMetrics(monthStart, tomorrow.toISOString().slice(0, 10)),
      getHotelSettings(),
    ]);
    monthlyMetrics = metrics;
    currency = settings.currency;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={format(new Date(), "EEEE, MMMM d, yyyy")}
      />

      {pendingCount > 0 && (
        <Link
          href="/dashboard/reservations"
          className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm hover:bg-warning/15"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <span className="text-foreground">
            <strong>{pendingCount}</strong> reservation{pendingCount > 1 ? "s" : ""} awaiting confirmation
          </span>
        </Link>
      )}

      {/* Room status snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ROOM_STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="font-display text-2xl font-medium text-foreground">{roomStatusCounts[status]}</p>
            <Badge variant={ROOM_STATUS_VARIANT[status]} className="mt-2">
              {ROOM_STATUS_LABEL[status]}
            </Badge>
          </div>
        ))}
      </div>

      {/* Arrivals / Departures */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-medium text-foreground">
            <LogIn className="h-4 w-4 text-primary" aria-hidden="true" />
            Today&apos;s Arrivals
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {arrivals.length}
            </span>
          </h2>
          {arrivals.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No arrivals expected today.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {arrivals.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{r.guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.room.roomType.name} · Room {r.room.roomNumber}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{r.confirmationCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-medium text-foreground">
            <LogOut className="h-4 w-4 text-primary" aria-hidden="true" />
            Today&apos;s Departures
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {departures.length}
            </span>
          </h2>
          {departures.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No departures expected today.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {departures.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{r.guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.room.roomType.name} · Room {r.room.roomNumber}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{r.confirmationCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin-only: monthly KPIs + quick links */}
      {user.role === "admin" && monthlyMetrics && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                This Month&apos;s Occupancy
              </p>
              <p className="font-display mt-2 text-2xl font-medium text-foreground">
                {monthlyMetrics.occupancyRate.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                This Month&apos;s Revenue
              </p>
              <p className="font-display mt-2 text-2xl font-medium text-foreground">
                {currency} {Math.round(monthlyMetrics.revenue).toLocaleString()}
              </p>
            </div>
            <Link
              href="/dashboard/admin/reports"
              className="flex flex-col justify-center gap-1 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground hover:bg-secondary"
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              View full reports →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="/dashboard/admin/gallery"
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground hover:bg-secondary/50"
            >
              <Images className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Gallery
            </Link>
            <Link
              href="/dashboard/admin/menu"
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground hover:bg-secondary/50"
            >
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Menu
            </Link>
            <Link
              href="/dashboard/admin/content"
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground hover:bg-secondary/50"
            >
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Content
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground hover:bg-secondary/50"
            >
              <UserCog className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Users
            </Link>
          </div>
        </>
      )}
    </div>
  );
}