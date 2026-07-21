import { z } from "zod";

export const hotelSettingsSchema = z.object({
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24-hour HH:mm format"),
  currency: z
    .string()
    .length(3, "Use a 3-letter currency code (e.g. RWF)")
    .transform((v) => v.toUpperCase()),
  taxRatePercent: z
    .number()
    .refine((v) => !Number.isNaN(v), { message: "Tax rate is required" })
    .min(0, "Tax rate can't be negative")
    .max(100, "Tax rate can't exceed 100%"),
});
export type HotelSettingsInput = z.infer<typeof hotelSettingsSchema>;

export const DEFAULT_HOTEL_SETTINGS: HotelSettingsInput = {
  checkInTime: "14:00",
  checkOutTime: "11:00",
  currency: "RWF",
  taxRatePercent: 18,
};
