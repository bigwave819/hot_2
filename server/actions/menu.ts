"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { menuItems } from "@/server/schema";
import { cloudinary } from "@/server/cloudinary";
import { menuItemSchema, type MenuItemInput } from "@/lib/validation/menu";
import { getMaxMenuDisplayOrder, listMenuItems } from "@/server/db/queries/menu";
import type { ActionResult } from "@/types/action-result";

const MENU_PATH = "/dashboard/admin/menu";

export async function createMenuItem(input: MenuItemInput): Promise<ActionResult> {
  await requireRole(["admin"]);

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, price, category, cloudinaryPublicId, isAvailable } = parsed.data;
  const displayOrder = (await getMaxMenuDisplayOrder(category)) + 1;

  await db.insert(menuItems).values({
    name,
    description: description || null,
    price: price.toFixed(2),
    category,
    cloudinaryPublicId: cloudinaryPublicId || null,
    isAvailable,
    displayOrder,
  });

  revalidatePath(MENU_PATH);
  return { success: true, data: undefined };
}

export async function updateMenuItem(id: string, input: MenuItemInput): Promise<ActionResult> {
  await requireRole(["admin"]);

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, price, category, cloudinaryPublicId, isAvailable } = parsed.data;

  await db
    .update(menuItems)
    .set({
      name,
      description: description || null,
      price: price.toFixed(2),
      category,
      cloudinaryPublicId: cloudinaryPublicId || null,
      isAvailable,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id));

  revalidatePath(MENU_PATH);
  return { success: true, data: undefined };
}

export async function setMenuItemAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
  await requireRole(["admin"]);
  await db.update(menuItems).set({ isAvailable, updatedAt: new Date() }).where(eq(menuItems.id, id));
  revalidatePath(MENU_PATH);
  return { success: true, data: undefined };
}

export async function reorderMenuItem(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole(["admin"]);

  const [target] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!target) return { success: false, error: "Item not found." };

  const all = await listMenuItems();
  const categorySiblings = all
    .filter((item) => item.category === target.category)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const index = categorySiblings.findIndex((item) => item.id === id);
  const neighbor = categorySiblings[direction === "up" ? index - 1 : index + 1];
  if (!neighbor) return { success: true, data: undefined };

  await db.update(menuItems).set({ displayOrder: neighbor.displayOrder }).where(eq(menuItems.id, target.id));
  await db.update(menuItems).set({ displayOrder: target.displayOrder }).where(and(eq(menuItems.id, neighbor.id)));

  revalidatePath(MENU_PATH);
  return { success: true, data: undefined };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  await requireRole(["admin"]);

  const [target] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!target) return { success: false, error: "Item not found." };

  await db.delete(menuItems).where(eq(menuItems.id, id));

  if (target.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(target.cloudinaryPublicId);
    } catch {
      // best-effort — an orphaned asset isn't worth failing the delete over
    }
  }

  revalidatePath(MENU_PATH);
  return { success: true, data: undefined };
}
