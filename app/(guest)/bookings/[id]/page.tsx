import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, CheckCircle2, XCircle, LogIn, Calendar, Users } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getReservationById } from "@/server/db/queries/reservations";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reservation" };

const STATUS_CONFIG: Record<
  string,
  { icon: typeof Clock; label: string; ring: string; iconColor: string; message: string }
> = {
  pending: {
    icon: Clock,
    label: "Pending Confirmation",
    ring: "bg-warning/15",
    iconColor: "text-warning",
    message: "A receptionist will review and confirm your reservation shortly.",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    ring: "bg-success/15",
    iconColor: "text-success",
    message: "You're all set. We look forward to welcoming you.",
  },
  checked_in: {
    icon: LogIn,
    label: "Checked In",
    ring: "bg-info/15",
    iconColor: "text-info",
    message: "Enjoy your stay at Baobab Hotel.",
  },
  checked_out: {
    icon: CheckCircle2,
    label: "Checked Out",
    ring: "bg-secondary",
    iconColor: "text-muted-foreground",
    message: "Thank you for staying with us.",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    ring: "bg-destructive/15",
    iconColor: "text-destructive",
    message: "This reservation was cancelled.",
  },
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
  const status = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const coverImage = reservation.room.roomType.imagePublicIds[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal className="flex flex-col items-center text-center">
        <div className={cn("relative flex h-20 w-20 items-center justify-center rounded-full", status.ring)}>
          {reservation.status === "pending" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-warning/20" />
          )}
          <StatusIcon className={cn("relative h-9 w-9", status.iconColor)} strokeWidth={1.5} />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{status.label}</p>
        <h1 className="font-display mt-1 text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
          {reservation.confirmationCode}
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">{status.message}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
        {coverImage && (
          <div className="relative h-48 w-full sm:h-56">
            <Image
              src={cloudinaryRawUrl(coverImage)}
              alt={reservation.room.roomType.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <p className="font-display absolute bottom-4 left-5 text-xl font-medium text-white">
              {reservation.room.roomType.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase">
              <Calendar className="h-3.5 w-3.5" /> Check-in
            </p>
            <p className="mt-1 font-medium text-foreground">
              {format(new Date(reservation.checkInDate), "EEE, MMM d yyyy")}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase">
              <Calendar className="h-3.5 w-3.5" /> Check-out
            </p>
            <p className="mt-1 font-medium text-foreground">
              {format(new Date(reservation.checkOutDate), "EEE, MMM d yyyy")}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase">
              <Users className="h-3.5 w-3.5" /> Guests
            </p>
            <p className="mt-1 font-medium text-foreground">{reservation.numGuests}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <span className="text-sm text-muted-foreground">
            {nights} night{nights > 1 ? "s" : ""} × RWF {Number(reservation.ratePerNight).toLocaleString()}
          </span>
          <span className="font-display text-lg font-medium text-foreground">
            RWF {(nights * Number(reservation.ratePerNight)).toLocaleString()}
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/bookings" className={buttonVariants({ variant: "outline" })}>
          View All Bookings
        </Link>
        <Link href="/rooms" className={buttonVariants()}>
          Browse More Rooms
        </Link>
      </Reveal>
    </div>
  );
}