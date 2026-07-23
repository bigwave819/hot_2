"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { reservations, rooms } from "@/server/schema";
import { canTransition } from "@/lib/reservation-status";
import type { ActionResult } from "@/types/action-result";

const RESERVATIONS_PATH = "/dashboard/reservations";
const ROOMS_PATH = "/dashboard/rooms";

async function getReservationOrError(id: string) {
  const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
  return reservation ?? null;
}

export async function confirmReservation(id: string): Promise<ActionResult> {
  const currentUser = await requireRole(["receptionist", "admin"]);

  const reservation = await getReservationOrError(id);
  if (!reservation) return { success: false, error: "Reservation not found." };
  if (!canTransition(reservation.status, "confirmed")) {
    return { success: false, error: `Can't confirm a reservation that is ${reservation.status}.` };
  }

  await db
    .update(reservations)
    .set({ status: "confirmed", confirmedByStaffId: currentUser.id, updatedAt: new Date() })
    .where(eq(reservations.id, id));

  revalidatePath(RESERVATIONS_PATH);
  return { success: true, data: undefined };
}

export async function checkInReservation(id: string): Promise<ActionResult> {
  const currentUser = await requireRole(["receptionist", "admin"]);

  const reservation = await getReservationOrError(id);
  if (!reservation) return { success: false, error: "Reservation not found." };
  if (!canTransition(reservation.status, "checked_in")) {
    return { success: false, error: `Can't check in a reservation that is ${reservation.status}.` };
  }

  // Two related writes (reservation status + room status) that must
  // succeed or fail together — the first real transaction in this
  // codebase, and the right call here: a partial write would leave a
  // room silently marked available while actually occupied, or vice versa.
  await db.transaction(async (tx) => {
    await tx
      .update(reservations)
      .set({ status: "checked_in", checkedInByStaffId: currentUser.id, updatedAt: new Date() })
      .where(eq(reservations.id, id));
    await tx.update(rooms).set({ status: "occupied", updatedAt: new Date() }).where(eq(rooms.id, reservation.roomId));
  });

  revalidatePath(RESERVATIONS_PATH);
  revalidatePath(ROOMS_PATH);
  return { success: true, data: undefined };
}

export async function checkOutReservation(id: string): Promise<ActionResult> {
  const currentUser = await requireRole(["receptionist", "admin"]);

  const reservation = await getReservationOrError(id);
  if (!reservation) return { success: false, error: "Reservation not found." };
  if (!canTransition(reservation.status, "checked_out")) {
    return { success: false, error: `Can't check out a reservation that is ${reservation.status}.` };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(reservations)
      .set({ status: "checked_out", checkedOutByStaffId: currentUser.id, updatedAt: new Date() })
      .where(eq(reservations.id, id));
    // Never jumps straight to "available" — matches the brief's flow:
    // checkout -> cleaning -> (housekeeping) -> available, the last step
    // being a manual action on the Rooms screen.
    await tx.update(rooms).set({ status: "cleaning", updatedAt: new Date() }).where(eq(rooms.id, reservation.roomId));
  });

  revalidatePath(RESERVATIONS_PATH);
  revalidatePath(ROOMS_PATH);
  return { success: true, data: undefined };
}

export async function cancelReservation(id: string, reason: string): Promise<ActionResult> {
  await requireRole(["receptionist", "admin"]);

  const reservation = await getReservationOrError(id);
  if (!reservation) return { success: false, error: "Reservation not found." };
  if (!canTransition(reservation.status, "cancelled")) {
    return { success: false, error: `Can't cancel a reservation that is ${reservation.status}.` };
  }

  await db
    .update(reservations)
    .set({ status: "cancelled", cancelledReason: reason || null, updatedAt: new Date() })
    .where(eq(reservations.id, id));

  revalidatePath(RESERVATIONS_PATH);
  return { success: true, data: undefined };
}