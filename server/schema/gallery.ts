import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { galleryCategoryEnum } from "./enums";

export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  caption: text("caption"),
  category: galleryCategoryEnum("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});