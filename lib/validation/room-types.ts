import { z } from "zod";

export const roomTypeSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10, "Description is required"),
  basePrice: z.coerce
    .number()
    .positive("Base price must be greater than 0"),
  maxGuests: z.coerce.number().int().positive(),
  sizeSqm: z.coerce.number().int().positive().optional().nullable(),
  imagePublicIds: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
});

export type RoomTypeInput = z.infer<typeof roomTypeSchema>;

export const roomTypeUpdateSchema = roomTypeSchema.partial().extend({
  id: z.string().uuid(),
});