import "server-only";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/server/db";
import { galleryImages } from "@/server/schema";
import type { galleryCategoryEnum } from "@/server/schema/enums";

export async function listGalleryImages() {
  return db.select().from(galleryImages).orderBy(asc(galleryImages.category), asc(galleryImages.displayOrder));
}
export type GalleryImageRow = Awaited<ReturnType<typeof listGalleryImages>>[number];

export async function getMaxDisplayOrder(category: (typeof galleryCategoryEnum.enumValues)[number]) {
  const [row] = await db
    .select({ max: max(galleryImages.displayOrder) })
    .from(galleryImages)
    .where(eq(galleryImages.category, category));
  return row?.max ?? -1;
}