import { pgTable, uuid, text, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { roomStatusEnum } from "./enums";


export const roomTypes = pgTable("room_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), 
  slug: text("slug").notNull().unique(), 
  description: text("description").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer("max_guests").notNull(),
  sizeSqm: integer("size_sqm"),
  imagePublicIds: jsonb("image_public_ids").$type<string[]>().notNull().default([]),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomTypeId: uuid("room_type_id")
    .notNull()
    .references(() => roomTypes.id, { onDelete: "restrict" }),
  roomNumber: text("room_number").notNull().unique(), // "204"
  floor: integer("floor"),
  status: roomStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});