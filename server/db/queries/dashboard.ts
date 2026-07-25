import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { reservations, rooms } from "@/server/schema";
import type { RoomStatus } from "@/lib/room-status";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Confirmed reservations checking in today — the "ready to check in" list. */
export async function getTodaysArrivals() {
  return db.query.reservations.findMany({
    where: and(eq(reservations.checkInDate, todayISO()), eq(reservations.status, "confirmed")),
    with: { guest: true, room: { with: { roomType: true } } },
  });
}
export type ArrivalRow = Awaited<ReturnType<typeof getTodaysArrivals>>[number];

/** Checked-in guests checking out today — the "ready to check out" list. */
export async function getTodaysDepartures() {
  return db.query.reservations.findMany({
    where: and(eq(reservations.checkOutDate, todayISO()), eq(reservations.status, "checked_in")),
    with: { guest: true, room: { with: { roomType: true } } },
  });
}
export type DepartureRow = Awaited<ReturnType<typeof getTodaysDepartures>>[number];

export async function getPendingReservationsCount(): Promise<number> {
  const rows = await db.select().from(reservations).where(eq(reservations.status, "pending"));
  return rows.length;
}

export async function getRoomStatusCounts(): Promise<Record<RoomStatus, number>> {
  const allRooms = await db.select({ status: rooms.status }).from(rooms);
  const counts: Record<RoomStatus, number> = {
    available: 0,
    reserved: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
  };
  for (const r of allRooms) counts[r.status]++;
  return counts;
}