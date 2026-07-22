"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { reservations, roomTypes } from "@/server/schema";
import { createReservationSchema, type CreateReservationInput } from "@/lib/validation/booking";
import { findAvailableRoomForType } from "@/server/db/queries/availability";
import type { ActionResult } from "@/types/action-result";

function generateConfirmationCode() {
  return `BB-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<ActionResult<{ reservationId: string }>> {
  const user = await requireUser();

  const parsed = createReservationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { roomTypeId, checkInDate, checkOutDate, numGuests, specialRequests } = parsed.data;

  const [roomType] = await db.select().from(roomTypes).where(eq(roomTypes.id, roomTypeId));
  if (!roomType || !roomType.isPublished) {
    return { success: false, error: "This room is no longer available." };
  }
  if (numGuests > roomType.maxGuests) {
    return { success: false, error: `This room sleeps up to ${roomType.maxGuests} guests.` };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (checkInDate < today) {
    return { success: false, error: "Check-in date can't be in the past." };
  }

  const availableRoom = await findAvailableRoomForType(roomTypeId, checkInDate, checkOutDate);
  if (!availableRoom) {
    return { success: false, error: "No rooms of this type are available for those dates." };
  }

  const [created] = await db
    .insert(reservations)
    .values({
      confirmationCode: generateConfirmationCode(),
      guestId: user.id,
      roomId: availableRoom.id,
      checkInDate,
      checkOutDate,
      numGuests,
      status: "pending",
      specialRequests: specialRequests || null,
      // Snapshot — the room type's price can change later without
      // affecting this reservation's agreed rate.
      ratePerNight: roomType.basePrice,
    })
    .returning({ id: reservations.id });

  revalidatePath("/dashboard/reservations");
  revalidatePath("/bookings");

  return { success: true, data: { reservationId: created.id } };
}