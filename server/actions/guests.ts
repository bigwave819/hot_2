"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { user, guestProfiles } from "@/server/schema";
import {
  createWalkInGuestSchema,
  guestProfileSchema,
  type CreateWalkInGuestInput,
  type GuestProfileInput,
} from "@/lib/validation/guests";
import type { ActionResult } from "@/types/action-result";

const GUESTS_PATH = "/dashboard/guests";

/**
 * Creates a guest for a front-desk walk-in — no online booking intent,
 * just capturing their info. Goes through Better Auth's real signup flow
 * (so password hashing/account rows are consistent) with a random,
 * never-shown password; the guest can request a reset later if they ever
 * want to log in online. Role defaults to "guest" already, so — unlike
 * staff account creation — no follow-up role escalation write is needed.
 */
export async function createWalkInGuest(
  input: CreateWalkInGuestInput,
): Promise<ActionResult<{ userId: string }>> {
  await requireRole(["receptionist", "admin"]);

  const parsed = createWalkInGuestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, nationality } = parsed.data;

  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password: crypto.randomUUID() },
      headers: await headers(),
    });

    if (phone || nationality) {
      await db.insert(guestProfiles).values({
        userId: result.user.id,
        phone: phone || null,
        nationality: nationality || null,
      });
    }

    revalidatePath(GUESTS_PATH);
    return { success: true, data: { userId: result.user.id } };
  } catch (err) {
    const message =
      err instanceof Error && err.message.toLowerCase().includes("already exist")
        ? "An account with this email already exists."
        : "Couldn't create the guest. Please try again.";
    return { success: false, error: message };
  }
}

export async function updateGuest(userId: string, input: GuestProfileInput): Promise<ActionResult> {
  await requireRole(["receptionist", "admin"]);

  const parsed = guestProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, phone, nationality, dateOfBirth, address, notes } = parsed.data;

  await db.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, userId));

  await db
    .insert(guestProfiles)
    .values({
      userId,
      phone: phone || null,
      nationality: nationality || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      notes: notes || null,
    })
    .onConflictDoUpdate({
      target: guestProfiles.userId,
      set: {
        phone: phone || null,
        nationality: nationality || null,
        dateOfBirth: dateOfBirth || null,
        address: address || null,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

  revalidatePath(GUESTS_PATH);
  revalidatePath(`${GUESTS_PATH}/${userId}`);
  return { success: true, data: undefined };
}