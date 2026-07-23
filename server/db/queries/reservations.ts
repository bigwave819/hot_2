import "server-only";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/server/db";
import { reservations } from "@/server/schema";

export async function listGuestReservations(guestId: string) {
  return db.query.reservations.findMany({
    where: eq(reservations.guestId, guestId),
    with: { room: { with: { roomType: true } } },
    orderBy: desc(reservations.createdAt),
  });
}
export type GuestReservationRow = Awaited<ReturnType<typeof listGuestReservations>>[number];

export async function getReservationById(id: string) {
  return db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: { room: { with: { roomType: true } } },
  });
}
export type ReservationDetail = Awaited<ReturnType<typeof getReservationById>>;


export async function listAllReservationsForStaff() {
  return db.query.reservations.findMany({
    with: { guest: true, room: { with: { roomType: true } } },
    orderBy: asc(reservations.checkInDate),
  });
}
export type StaffReservationRow = Awaited<ReturnType<typeof listAllReservationsForStaff>>[number];