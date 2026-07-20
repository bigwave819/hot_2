"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { siteContent } from "@/server/schema";
import { requireRole } from "@/server/auth/session";
import { getContentBlock, schemaForBlock } from "@/lib/content-blocks";
import type { ActionResult } from "@/types/action-result";

export async function updateSiteContent(key: string, values: Record<string, string>): Promise<ActionResult> {
  const currentUser = await requireRole(["admin"]);

  const block = getContentBlock(key);
  if (!block) {
    return { success: false, error: "Unknown content block." };
  }

  const parsed = schemaForBlock(block).safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .insert(siteContent)
    .values({
      key,
      value: parsed.data,
      updatedByStaffId: currentUser.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: parsed.data, updatedByStaffId: currentUser.id, updatedAt: new Date() },
    });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/content");

  return { success: true, data: undefined };
}