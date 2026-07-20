import { z } from "zod";

export const galleryCategorySchema = z.enum(["rooms", "restaurant", "exterior", "amenities", "events"]);

export const addGalleryImagesSchema = z.object({
  category: galleryCategorySchema,
  images: z
    .array(
      z.object({
        cloudinaryPublicId: z.string().min(1),
        caption: z.string().optional(),
      }),
    )
    .min(1, "Add at least one image"),
});
export type AddGalleryImagesInput = z.infer<typeof addGalleryImagesSchema>;