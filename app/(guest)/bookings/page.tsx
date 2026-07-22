import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { format } from "date-fns";
import { requireUser } from "@/server/auth/session";
import { listGuestReservations } from "@/server/db/queries/reservations";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = { title: "My Bookings" };

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "info"> = {
  pending: "warning",
  confirmed: "success",
  checked_in: "info",
  checked_out: "default",
  cancelled: "destructive",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export default async function BookingsPage() {
  const user = await requireUser();
  const reservations = await listGuestReservations(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Your stays</p>
        <h1 className="font-display mt-2 text-3xl font-medium text-foreground sm:text-4xl">My Bookings</h1>
      </Reveal>

      {reservations.length === 0 ? (
        <Reveal className="mt-10">
          <EmptyState
            title="No bookings yet"
            description="Browse our rooms and make your first reservation."
            action={
              <Link href="/rooms" className={buttonVariants()}>
                Browse Rooms
              </Link>
            }
          />
        </Reveal>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {reservations.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.06}>
              <Link
                href={`/bookings/${r.id}`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md sm:gap-5 sm:p-4"
              >
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-32">
                  {r.room.roomType.imagePublicIds[0] ? (
                    <Image
                      src={cloudinaryRawUrl(r.room.roomType.imagePublicIds[0])}
                      alt={r.room.roomType.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-medium text-foreground">{r.room.roomType.name}</h2>
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(r.checkInDate), "MMM d")} → {format(new Date(r.checkOutDate), "MMM d, yyyy")}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{r.confirmationCode}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}