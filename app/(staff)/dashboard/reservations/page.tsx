import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listAllReservationsForStaff } from "@/server/db/queries/reservations";
import { PageHeader } from "@/components/shared/page-header";
import { ReservationsManager } from "./reservations-manager";

export const metadata: Metadata = { title: "Reservations" };

export default async function ReservationsPage() {
  await requireRole(["receptionist", "admin"]);
  const reservations = await listAllReservationsForStaff();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reservations" description="Review, confirm, and manage guest reservations." />
      <ReservationsManager reservations={reservations} />
    </div>
  );
}