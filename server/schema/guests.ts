import { pgTable, uuid, text, date, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Hotel-specific profile data for anyone with the "guest" role. Deliberately
 * 1:1 with `user` via a unique FK rather than merged into it — Better
 * Auth's user table should only ever contain what Better Auth needs.
 *
 * Every reservation requires a user account (per the booking flow), so a
 * receptionist creating a walk-in booking creates a minimal `user` first
 * (see the reservations feature), then this profile is filled in
 * incrementally — most fields are nullable for that reason.
 *
 * Deliberately does NOT store a government ID type/number — this hotel's
 * policy is to not collect that data. If a future requirement needs it,
 * add it as its own migration rather than reviving this comment's ghost.
 */
export const guestProfiles = pgTable("guest_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  nationality: text("nationality"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  notes: text("notes"), // staff-visible notes (dietary needs, preferences, incidents)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});