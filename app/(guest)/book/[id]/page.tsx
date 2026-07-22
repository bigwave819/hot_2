import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { getReservationById } from "@/server/db/queries/reservations";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Reservation" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const reservation = await getReservationById(id);

  // Ownership check — (guest) layout only confirms *someone* is signed
  // in, not that this reservation belongs to them.
  if (!reservation || reservation.guestId !== user.id) notFound();

  const nights = Math.round(
    (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / 86_400_000,
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">Confirmation code</p>
      <h1 className="font-display text-3xl font-medium text-foreground">{reservation.confirmationCode}</h1>
      <Badge variant={reservation.status === "cancelled" ? "destructive" : "success"} className="mt-3">
        {STATUS_LABEL[reservation.status]}
      </Badge>

      <div className="mt-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Room</span>
          <span className="font-medium text-foreground">{reservation.room.roomType.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-in</span>
          <span className="font-medium text-foreground">{reservation.checkInDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-out</span>
          <span className="font-medium text-foreground">{reservation.checkOutDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Guests</span>
          <span className="font-medium text-foreground">{reservation.numGuests}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-4">
          <span className="text-muted-foreground">
            {nights} night{nights > 1 ? "s" : ""} × RWF {Number(reservation.ratePerNight).toLocaleString()}
          </span>
          <span className="font-medium text-foreground">
            RWF {(nights * Number(reservation.ratePerNight)).toLocaleString()}
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        A receptionist will review and confirm your reservation. You can check its status anytime under My
        Bookings.
      </p>
    </div>
  );
}