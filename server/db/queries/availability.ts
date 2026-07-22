import "server-only";
import { eq, and, inArray, lt, gt } from "drizzle-orm";
import { db } from "@/server/db";
import { rooms, reservations } from "@/server/schema";

const HOLDING_STATUSES = ["pending", "confirmed", "checked_in"] as const;

/**
 * Returns the first physical room of the given type with no overlapping
 * reservation for [checkIn, checkOut), or null if the type is fully
 * booked for those dates. Overlap check: an existing reservation blocks
 * these dates if it starts before our checkout AND ends after our
 * check-in — the standard interval-overlap condition.
 */
export async function findAvailableRoomForType(roomTypeId: string, checkInDate: string, checkOutDate: string) {
  const typeRooms = await db.select().from(rooms).where(eq(rooms.roomTypeId, roomTypeId));
  if (typeRooms.length === 0) return null;

  const roomIds = typeRooms.map((r) => r.id);
  const overlapping = await db
    .select({ roomId: reservations.roomId })
    .from(reservations)
    .where(
      and(
        inArray(reservations.roomId, roomIds),
        inArray(reservations.status, HOLDING_STATUSES),
        lt(reservations.checkInDate, checkOutDate),
        gt(reservations.checkOutDate, checkInDate),
      ),
    );

  const bookedRoomIds = new Set(overlapping.map((r) => r.roomId));
  return typeRooms.find((r) => !bookedRoomIds.has(r.id)) ?? null;
}