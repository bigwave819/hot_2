import { pgEnum } from "drizzle-orm/pg-core";

// ---- Users & auth ----
export const userRoleEnum = pgEnum("user_role", ["guest", "receptionist", "admin"]);

// ---- Rooms ----
export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "reserved",
  "occupied",
  "cleaning",
  "maintenance",
]);

// ---- Reservations ----
export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
]);

// ---- Payments ----
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "mobile_money"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);

// ---- Gallery ----
export const galleryCategoryEnum = pgEnum("gallery_category", [
  "rooms",
  "restaurant",
  "exterior",
  "amenities",
  "events",
]);