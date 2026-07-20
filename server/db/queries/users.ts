import "server-only";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/schema";

export async function listStaffUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(inArray(user.role, ["receptionist", "admin"]))
    .orderBy(desc(user.createdAt));
}

export type StaffUserRow = Awaited<ReturnType<typeof listStaffUsers>>[number];