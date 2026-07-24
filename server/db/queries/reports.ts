import "server-only";
import { and, ne, lt, gt, gte, count } from "drizzle-orm";
import { db } from "@/server/db";
import { reservations, rooms } from "@/server/schema";
import type { ReservationStatus } from "@/lib/reservation-status";

export type ReportMetrics = {
  period: { start: string; end: string };
  occupancyRate: number; // 0-100
  occupiedRoomNights: number;
  totalRoomNights: number;
  revenue: number;
  averageNightlyRate: number;
  totalReservations: number; // arrivals in period, any status
  cancellationRate: number; // 0-100
  statusBreakdown: Record<ReservationStatus, number>;
  revenueByRoomType: { roomTypeName: string; revenue: number }[];
  dailyRevenue: { date: string; revenue: number }[];
};

/**
 * All metrics for [startDate, endDate). Two distinct calculations live
 * here, deliberately kept separate:
 * 1. Occupancy/revenue — from reservations OVERLAPPING the period, with
 *    each reservation's nights clipped to the period boundary, counting
 *    only confirmed/checked_in/checked_out (pending isn't a firm booking).
 * 2. Arrivals/status breakdown/cancellation rate — from reservations
 *    whose check-in DATE falls in the period, any status, uncapped.
 * These answer different questions ("how full were we" vs "how much
 * booking activity happened") and conflating them would misrepresent both.
 */
export async function getReportMetrics(startDate: string, endDate: string): Promise<ReportMetrics> {
  const [roomCountRow] = await db.select({ value: count() }).from(rooms);
  const roomCount = roomCountRow?.value ?? 0;

  const overlapping = await db.query.reservations.findMany({
    where: and(ne(reservations.status, "cancelled"), lt(reservations.checkInDate, endDate), gt(reservations.checkOutDate, startDate)),
    with: { room: { with: { roomType: true } } },
  });

  const periodStart = new Date(startDate);
  const periodEnd = new Date(endDate);
  const totalDays = Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / 86_400_000));
  const totalRoomNights = roomCount * totalDays;

  let occupiedRoomNights = 0;
  let revenue = 0;
  const revenueByType = new Map<string, number>();
  const dailyRevenueMap = new Map<string, number>();

  for (const r of overlapping) {
    if (r.status === "pending") continue;

    const resStart = new Date(r.checkInDate);
    const resEnd = new Date(r.checkOutDate);
    const clippedStart = resStart > periodStart ? resStart : periodStart;
    const clippedEnd = resEnd < periodEnd ? resEnd : periodEnd;
    const nights = Math.max(0, Math.round((clippedEnd.getTime() - clippedStart.getTime()) / 86_400_000));
    if (nights === 0) continue;

    const rate = Number(r.ratePerNight);
    occupiedRoomNights += nights;
    revenue += nights * rate;

    const typeName = r.room.roomType.name;
    revenueByType.set(typeName, (revenueByType.get(typeName) ?? 0) + nights * rate);

    for (let i = 0; i < nights; i++) {
      const d = new Date(clippedStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyRevenueMap.set(key, (dailyRevenueMap.get(key) ?? 0) + rate);
    }
  }

  const arrivals = await db
    .select()
    .from(reservations)
    .where(and(gte(reservations.checkInDate, startDate), lt(reservations.checkInDate, endDate)));

  const statusBreakdown: Record<ReservationStatus, number> = {
    pending: 0,
    confirmed: 0,
    checked_in: 0,
    checked_out: 0,
    cancelled: 0,
  };
  for (const r of arrivals) statusBreakdown[r.status]++;

  const totalReservations = arrivals.length;
  const cancellationRate = totalReservations > 0 ? (statusBreakdown.cancelled / totalReservations) * 100 : 0;

  const dailyRevenue = Array.from(dailyRevenueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, revenue: value }));

  return {
    period: { start: startDate, end: endDate },
    occupancyRate: totalRoomNights > 0 ? (occupiedRoomNights / totalRoomNights) * 100 : 0,
    occupiedRoomNights,
    totalRoomNights,
    revenue,
    averageNightlyRate: occupiedRoomNights > 0 ? revenue / occupiedRoomNights : 0,
    totalReservations,
    cancellationRate,
    statusBreakdown,
    revenueByRoomType: Array.from(revenueByType.entries()).map(([roomTypeName, value]) => ({
      roomTypeName,
      revenue: value,
    })),
    dailyRevenue,
  };
}