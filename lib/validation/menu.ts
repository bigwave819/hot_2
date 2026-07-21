import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z
    .number()
    .refine((v) => !Number.isNaN(v), { message: "Price is required" })
    .positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  cloudinaryPublicId: z.string().optional(),
  isAvailable: z.boolean(),
});
export type MenuItemInput = z.infer<typeof menuItemSchema>;
