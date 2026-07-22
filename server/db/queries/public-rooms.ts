import "server-only";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/server/db";
import { roomTypes } from "@/server/schema";

export async function listPublishedRoomTypes(limit?: number) {
  const query = db
    .select()
    .from(roomTypes)
    .where(eq(roomTypes.isPublished, true))
    .orderBy(asc(roomTypes.createdAt));
  return limit ? query.limit(limit) : query;
}
export type PublicRoomType = Awaited<ReturnType<typeof listPublishedRoomTypes>>[number];


export async function getPublishedRoomTypeBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(roomTypes)
    .where(and(eq(roomTypes.slug, slug), eq(roomTypes.isPublished, true)));
  return row ?? null;
}
