import { z } from "zod";

export const recordPaymentSchema = z.object({
  reservationId: z.string().min(1),
  amount: z
    .number()
    .refine((v) => !Number.isNaN(v), { message: "Amount is required" })
    .positive("Amount must be greater than 0"),
  method: z.enum(["cash", "card", "mobile_money"]),
  status: z.enum(["pending", "paid"]),
  notes: z.string().optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;