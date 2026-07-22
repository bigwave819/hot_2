import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listPublishedRoomTypes } from "@/server/db/queries/public-rooms";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description: "Browse rooms and suites at Baobab Hotel, Kigali. Modern comfort, refined Rwandan hospitality.",
};

export default async function RoomsPage() {
  const roomTypes = await listPublishedRoomTypes();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Accommodation</p>
        <h1 className="font-display mt-2 text-4xl font-medium text-foreground sm:text-5xl">Rooms & Suites</h1>
        <p className="mt-4 text-muted-foreground">
          Every room blends modern comfort with warm Rwandan hospitality. Find the one that fits your stay.
        </p>
      </Reveal>

      {roomTypes.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          Rooms are being added — check back shortly, or contact us directly to book.
        </p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((room, i) => (
            <Reveal key={room.id} delay={i * 0.08}>
              <Link href={`/rooms/${room.slug}`} className="group block">
                <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-secondary">
                  {room.imagePublicIds[0] ? (
                    <Image
                      src={cloudinaryRawUrl(room.imagePublicIds[0])}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No photo yet
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-medium text-foreground">{room.name}</h2>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    RWF {Number(room.basePrice).toLocaleString()}/night
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Sleeps up to {room.maxGuests}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{room.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}