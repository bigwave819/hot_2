import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { requireRole } from "@/server/auth/session";
import { getGuestById } from "@/server/db/queries/guests";
import { listGuestReservations } from "@/server/db/queries/reservations";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { GuestEditForm } from "./edit-guest-form";
import type { GuestReservationRow } from "@/server/db/queries/reservations";
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_VARIANT } from "@/lib/reservation-status";

export const metadata: Metadata = { title: "Guest" };

export default async function GuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(["receptionist", "admin"]);

  const guest = await getGuestById(id);
  if (!guest) notFound();

  const reservations = await listGuestReservations(id);

  const columns: DataTableColumn<GuestReservationRow>[] = [
    { header: "Room", cell: (r) => r.room.roomType.name },
    { header: "Dates", cell: (r) => `${r.checkInDate} → ${r.checkOutDate}` },
    { header: "Code", cell: (r) => <span className="font-mono text-xs">{r.confirmationCode}</span> },
    {
      header: "Status",
      cell: (r) => <Badge variant={RESERVATION_STATUS_VARIANT[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/guests" className="text-sm text-muted-foreground hover:text-foreground">
        ← All guests
      </Link>

      <PageHeader
        title={guest.name}
        description={`${guest.email} · Joined ${format(new Date(guest.createdAt), "MMM d, yyyy")}`}
      />

      <GuestEditForm guest={guest} />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-foreground">Reservation History</h2>
        <DataTable
          columns={columns}
          data={reservations}
          getRowId={(r) => r.id}
          emptyTitle="No reservations yet"
        />
      </div>
    </div>
  );
}