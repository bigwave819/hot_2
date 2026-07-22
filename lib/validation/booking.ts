import { z } from "zod";

export const createReservationSchema = z
  .object({
    roomTypeId: z.string().min(1),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    numGuests: z.number().int().positive(),
    specialRequests: z.string().optional(),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });
export type CreateReservationInput = z.infer<typeof createReservationSchema>;