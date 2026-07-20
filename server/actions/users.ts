"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { user } from "@/server/schema";
import {
  createStaffUserSchema,
  updateUserRoleSchema,
  type CreateStaffUserInput,
} from "@/lib/validation/users";
import type { ActionResult } from "@/types/action-result";

export async function createStaffUser(input: CreateStaffUserInput): Promise<ActionResult> {
  await requireRole(["admin"]);

  const parsed = createStaffUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password, role } = parsed.data;

  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });

    await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, result.user.id));

    revalidatePath("/dashboard/admin/users");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error && err.message.toLowerCase().includes("already exist")
        ? "An account with this email already exists."
        : "Couldn't create the account. Please try again.";
    return { success: false, error: message };
  }
}

export async function updateUserRole(input: { userId: string; role: "receptionist" | "admin" }): Promise<ActionResult> {
  const currentUser = await requireRole(["admin"]);

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.userId === currentUser.id && parsed.data.role !== "admin") {
    return { success: false, error: "You can't change your own role." };
  }

  await db
    .update(user)
    .set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(user.id, parsed.data.userId));

  revalidatePath("/dashboard/admin/users");
  return { success: true, data: undefined };
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const currentUser = await requireRole(["admin"]);

  if (userId === currentUser.id && !isActive) {
    return { success: false, error: "You can't deactivate your own account." };
  }

  await db.update(user).set({ isActive, updatedAt: new Date() }).where(eq(user.id, userId));

  revalidatePath("/dashboard/admin/users");
  return { success: true, data: undefined };
}