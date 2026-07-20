import { db } from "@/server/db";
import { roomTypes, rooms } from "@/server/schema";
import { eq, asc } from "drizzle-orm";

export async function getRoomTypes() {
  return db.query.roomTypes.findMany({
    orderBy: asc(roomTypes.name),
  });
}

export async function getRoomTypeById(id: string) {
  return db.query.roomTypes.findFirst({
    where: eq(roomTypes.id, id),
  });
}

export async function getRooms() {
  return db.query.rooms.findMany({
    with: { roomType: true },
    orderBy: asc(rooms.roomNumber),
  });
}

export async function getRoomById(id: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.id, id),
    with: { roomType: true },
  });
}

export async function countRoomsByType(roomTypeId: string) {
  const result = await db.query.rooms.findMany({
    where: eq(rooms.roomTypeId, roomTypeId),
    columns: { id: true },
  });
  return result.length;
}