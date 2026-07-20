import { z } from "zod";

export const roomStatusValues = [
  "available",
  "reserved",
  "occupied",
  "cleaning",
  "maintenance",
] as const;

export const roomSchema = z.object({
  roomTypeId: z.string().uuid("Select a room type"),
  roomNumber: z.string().min(1, "Room number is required").max(20),
  floor: z.coerce.number().int().optional().nullable(),
  status: z.enum(roomStatusValues).default("available"),
});

export type RoomInput = z.infer<typeof roomSchema>;

export const roomUpdateSchema = roomSchema.partial().extend({
  id: z.string().uuid(),
});

export const roomStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(roomStatusValues),
});