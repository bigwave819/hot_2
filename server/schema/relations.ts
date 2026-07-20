import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { guestProfiles } from "./guests";
import { roomTypes, rooms } from "./rooms";
import { reservations } from "./reservations";
import { payments } from "./payments";

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  guestProfile: one(guestProfiles, {
    fields: [user.id],
    references: [guestProfiles.userId],
  }),
  reservationsAsGuest: many(reservations, { relationName: "guestReservations" }),
}));

export const guestProfileRelations = relations(guestProfiles, ({ one }) => ({
  user: one(user, {
    fields: [guestProfiles.userId],
    references: [user.id],
  }),
}));

export const roomTypeRelations = relations(roomTypes, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  roomType: one(roomTypes, {
    fields: [rooms.roomTypeId],
    references: [roomTypes.id],
  }),
  reservations: many(reservations),
}));

export const reservationRelations = relations(reservations, ({ one, many }) => ({
  guest: one(user, {
    fields: [reservations.guestId],
    references: [user.id],
    relationName: "guestReservations",
  }),
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
  payments: many(payments),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  reservation: one(reservations, {
    fields: [payments.reservationId],
    references: [reservations.id],
  }),
  recordedByStaff: one(user, {
    fields: [payments.recordedByStaffId],
    references: [user.id],
  }),
}));