import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { user, guestProfiles } from "@/server/schema";

export async function listGuests() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      phone: guestProfiles.phone,
      nationality: guestProfiles.nationality,
    })
    .from(user)
    .leftJoin(guestProfiles, eq(guestProfiles.userId, user.id))
    .where(eq(user.role, "guest"))
    .orderBy(desc(user.createdAt));
}
export type GuestListRow = Awaited<ReturnType<typeof listGuests>>[number];

export async function getGuestById(userId: string) {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: {
        phone: guestProfiles.phone,
        nationality: guestProfiles.nationality,
        dateOfBirth: guestProfiles.dateOfBirth,
        address: guestProfiles.address,
        notes: guestProfiles.notes,
      },
    })
    .from(user)
    .leftJoin(guestProfiles, eq(guestProfiles.userId, user.id))
    .where(and(eq(user.id, userId), eq(user.role, "guest")));
  return row ?? null;
}
export type GuestDetail = Awaited<ReturnType<typeof getGuestById>>;