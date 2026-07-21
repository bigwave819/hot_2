import "server-only";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/server/db";
import { menuItems } from "@/server/schema";

export async function listMenuItems() {
  return db.select().from(menuItems).orderBy(asc(menuItems.category), asc(menuItems.displayOrder));
}
export type MenuItemRow = Awaited<ReturnType<typeof listMenuItems>>[number];

export async function getMaxMenuDisplayOrder(category: string) {
  const [row] = await db.select({ max: max(menuItems.displayOrder) }).from(menuItems).where(eq(menuItems.category, category));
  return row?.max ?? -1;
}
