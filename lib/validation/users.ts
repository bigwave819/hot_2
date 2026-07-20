import { z } from "zod";

export const staffRoleSchema = z.enum(["receptionist", "admin"]);

export const createStaffUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: staffRoleSchema,
});
export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: staffRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;