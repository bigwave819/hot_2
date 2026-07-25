import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please include a few more details"),
});
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;