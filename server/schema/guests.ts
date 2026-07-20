import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const guestProfiles = pgTable("guest_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  nationality: text("nationality"),
  idNumber: text("id_number"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});