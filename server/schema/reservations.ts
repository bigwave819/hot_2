import { pgTable, uuid, text, integer, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { reservationStatusEnum } from "./enums";
import { user } from "./auth";
import { rooms } from "./rooms";

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  confirmationCode: text("confirmation_code").notNull().unique(),
  guestId: text("guest_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "restrict" }),

  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  numGuests: integer("num_guests").notNull().default(1),

  status: reservationStatusEnum("status").notNull().default("pending"),
  specialRequests: text("special_requests"),


  ratePerNight: numeric("rate_per_night", { precision: 10, scale: 2 }).notNull(),


  confirmedByStaffId: text("confirmed_by_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  checkedInByStaffId: text("checked_in_by_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  checkedOutByStaffId: text("checked_out_by_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  cancelledReason: text("cancelled_reason"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});