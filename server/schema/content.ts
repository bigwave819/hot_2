import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";


export const siteContent = pgTable("site_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // "homepage.hero", "about.body", "contact.info"
  value: jsonb("value").notNull(),
  updatedByStaffId: text("updated_by_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedByStaffId: text("updated_by_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});