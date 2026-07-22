import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getPublishedRoomTypeBySlug } from "@/server/db/queries/public-rooms";
import { getHotelSettings } from "@/server/db/queries/settings";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { Reveal } from "@/components/public/reveal";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book Your Stay" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room: slug } = await searchParams;
  if (!slug) notFound();

  const room = await getPublishedRoomTypeBySlug(slug);
  if (!room) notFound();

  const settings = await getHotelSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <Link href={`/rooms/${room.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to {room.name}
        </Link>
        <h1 className="font-display mt-3 text-3xl font-medium text-foreground sm:text-4xl">
          Complete Your Booking
        </h1>
        <p className="mt-2 text-muted-foreground">
          Check-in from {settings.checkInTime} · Check-out by {settings.checkOutTime}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Room preview — the thing that was missing: you should SEE what you're booking */}
        <Reveal className="lg:col-span-2">
          <div className="sticky top-24 overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-4/3">
              {room.imagePublicIds[0] ? (
                <Image src={cloudinaryRawUrl(room.imagePublicIds[0])} alt={room.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary text-sm text-muted-foreground">
                  No photo yet
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-medium text-foreground">{room.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sleeps up to {room.maxGuests}
                {room.sizeSqm ? ` · ${room.sizeSqm} m²` : ""}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{room.description}</p>

              {room.amenities.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1.5">
                  {room.amenities.slice(0, 5).map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              )}

              <p className="font-display mt-5 border-t border-border pt-4 text-lg font-medium text-foreground">
                RWF {Number(room.basePrice).toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground"> / night</span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <BookingForm room={room} settings={settings} />
        </Reveal>
      </div>
    </div>
  );
}