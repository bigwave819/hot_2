import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { reservations } from "./reservations";
import { user } from "./auth";


export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reservationId: uuid("reservation_id")
    .notNull()
    .references(() => reservations.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  recordedByStaffId: text("recorded_by_staff_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});