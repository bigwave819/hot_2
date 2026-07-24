import "server-only";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { payments } from "@/server/schema";

export async function listAllPayments() {
  return db.query.payments.findMany({
    with: {
      reservation: { with: { guest: true, room: { with: { roomType: true } } } },
      recordedByStaff: true,
    },
    orderBy: desc(payments.createdAt),
  });
}
export type PaymentRow = Awaited<ReturnType<typeof listAllPayments>>[number];

/** Sum of everything actually marked "paid" against a reservation — used to show a running balance. */
export async function getPaidTotalForReservation(reservationId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(and(eq(payments.reservationId, reservationId), eq(payments.status, "paid")));
  return Number(row?.total ?? 0);
}