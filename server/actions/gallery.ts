"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { db } from "@/server/db";
import { galleryImages } from "@/server/schema";
import { cloudinary } from "@/server/cloudinary";
import { addGalleryImagesSchema, type AddGalleryImagesInput } from "@/lib/validation/gallery";
import { getMaxDisplayOrder, listGalleryImages } from "@/server/db/queries/gallery";
import type { ActionResult } from "@/types/action-result";

const GALLERY_PATH = "/dashboard/admin/gallery";

export async function addGalleryImages(input: AddGalleryImagesInput): Promise<ActionResult> {
  await requireRole(["admin"]);

  const parsed = addGalleryImagesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { category, images } = parsed.data;
  const startOrder = (await getMaxDisplayOrder(category)) + 1;

  await db.insert(galleryImages).values(
    images.map((img, i) => ({
      cloudinaryPublicId: img.cloudinaryPublicId,
      caption: img.caption || null,
      category,
      displayOrder: startOrder + i,
    })),
  );

  revalidatePath(GALLERY_PATH);
  return { success: true, data: undefined };
}

export async function updateGalleryImageCaption(id: string, caption: string): Promise<ActionResult> {
  await requireRole(["admin"]);
  await db
    .update(galleryImages)
    .set({ caption: caption || null })
    .where(eq(galleryImages.id, id));
  revalidatePath(GALLERY_PATH);
  return { success: true, data: undefined };
}

export async function reorderGalleryImage(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole(["admin"]);

  const [target] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
  if (!target) return { success: false, error: "Image not found." };

  const siblings = await listGalleryImages();
  const categorySiblings = siblings
    .filter((img) => img.category === target.category)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const index = categorySiblings.findIndex((img) => img.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = categorySiblings[neighborIndex];
  if (!neighbor) return { success: true, data: undefined }; // already at the edge, no-op

  await db
    .update(galleryImages)
    .set({ displayOrder: neighbor.displayOrder })
    .where(eq(galleryImages.id, target.id));
  await db
    .update(galleryImages)
    .set({ displayOrder: target.displayOrder })
    .where(and(eq(galleryImages.id, neighbor.id)));

  revalidatePath(GALLERY_PATH);
  return { success: true, data: undefined };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  await requireRole(["admin"]);

  const [target] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
  if (!target) return { success: false, error: "Image not found." };

  await db.delete(galleryImages).where(eq(galleryImages.id, id));

  // Best-effort cleanup — an orphaned Cloudinary asset is a much smaller
  // problem than a failed admin action, so this never blocks the delete.
  try {
    await cloudinary.uploader.destroy(target.cloudinaryPublicId);
  } catch {
    // swallow — nothing actionable for the admin to do here
  }

  revalidatePath(GALLERY_PATH);
  return { success: true, data: undefined };
}