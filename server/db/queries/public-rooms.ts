import "server-only";
import { eq, asc } from "drizzle-orm";
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