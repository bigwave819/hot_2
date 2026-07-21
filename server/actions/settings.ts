"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { settings } from "@/server/schema";
import { requireRole } from "@/server/auth/session";
import { hotelSettingsSchema, type HotelSettingsInput } from "@/lib/validation/settings";
import { SETTINGS_KEY } from "@/server/db/queries/settings";
import type { ActionResult } from "@/types/action-result";

export async function updateHotelSettings(input: HotelSettingsInput): Promise<ActionResult> {
  const currentUser = await requireRole(["admin"]);

  const parsed = hotelSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .insert(settings)
    .values({
      key: SETTINGS_KEY,
      value: parsed.data,
      updatedByStaffId: currentUser.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: parsed.data, updatedByStaffId: currentUser.id, updatedAt: new Date() },
    });

  // These values will drive booking-flow check-in/out display and price
  // calculations once that feature exists — revalidate broadly now so
  // nothing gets missed later.
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/settings");

  return { success: true, data: undefined };
}
