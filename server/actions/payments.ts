"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { payments } from "@/server/schema";
import { recordPaymentSchema, type RecordPaymentInput } from "@/lib/validation/payments";
import type { ActionResult } from "@/types/action-result";

const PAYMENTS_PATH = "/dashboard/payments";
const RESERVATIONS_PATH = "/dashboard/reservations";

export async function recordPayment(input: RecordPaymentInput): Promise<ActionResult> {
  const currentUser = await requireRole(["receptionist", "admin"]);

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { reservationId, amount, method, status, notes } = parsed.data;

  await db.insert(payments).values({
    reservationId,
    amount: amount.toFixed(2),
    method,
    status,
    recordedByStaffId: currentUser.id,
    paidAt: status === "paid" ? new Date() : null,
    notes: notes || null,
  });

  revalidatePath(PAYMENTS_PATH);
  revalidatePath(RESERVATIONS_PATH);
  return { success: true, data: undefined };
}

export async function markPaymentPaid(id: string): Promise<ActionResult> {
  await requireRole(["receptionist", "admin"]);

  await db.update(payments).set({ status: "paid", paidAt: new Date() }).where(eq(payments.id, id));

  revalidatePath(PAYMENTS_PATH);
  revalidatePath(RESERVATIONS_PATH);
  return { success: true, data: undefined };
}