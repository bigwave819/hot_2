import { z } from "zod";

export const guestProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
export type GuestProfileInput = z.infer<typeof guestProfileSchema>;

export const createWalkInGuestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
});
export type CreateWalkInGuestInput = z.infer<typeof createWalkInGuestSchema>;