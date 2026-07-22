import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getPublishedRoomTypeBySlug } from "@/server/db/queries/public-rooms";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await getPublishedRoomTypeBySlug(slug);
  if (!room) return { title: "Room Not Found" };

  return {
    title: room.name,
    description: room.description,
    openGraph: {
      title: `${room.name} — Baobab Hotel`,
      description: room.description,
      images: room.imagePublicIds[0] ? [cloudinaryRawUrl(room.imagePublicIds[0])] : undefined,
    },
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = await getPublishedRoomTypeBySlug(slug);
  if (!room) notFound();

  const images = room.imagePublicIds.length > 0 ? room.imagePublicIds : [null];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HotelRoom",
            name: room.name,
            description: room.description,
            occupancy: { "@type": "QuantitativeValue", maxValue: room.maxGuests },
          }),
        }}
      />

      <Reveal>
        <Link href="/rooms" className="text-sm text-muted-foreground hover:text-foreground">
          ← All rooms
        </Link>
      </Reveal>

      {/* Photo gallery - main image larger */}
      <Reveal className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* Main image - spans full width on mobile, 3 columns on desktop */}
        <div className="relative col-span-1 aspect-video overflow-hidden rounded-lg bg-secondary sm:col-span-3 sm:aspect-video">
          {images[0] ? (
            <Image
              src={cloudinaryRawUrl(images[0])}
              alt={room.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 66vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No photos yet
            </div>
          )}
        </div>

        {/* Thumbnails - 1 column on desktop, hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-1 gap-3">
          {images.slice(1, 4).map((publicId, i) => (
            <div key={publicId ?? i} className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
              {publicId && (
                <Image
                  src={cloudinaryRawUrl(publicId)}
                  alt={`${room.name} photo ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 33vw"
                />
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Mobile thumbnails - horizontal scroll on mobile */}
      {images.length > 1 && (
        <Reveal className="mt-3 flex gap-3 sm:hidden overflow-x-auto pb-2">
          {images.slice(1, 5).map((publicId, i) => (
            <div key={publicId ?? i} className="relative min-w-30 aspect-video shrink-0 overflow-hidden rounded-lg bg-secondary">
              {publicId && (
                <Image
                  src={cloudinaryRawUrl(publicId)}
                  alt={`${room.name} photo ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              )}
            </div>
          ))}
        </Reveal>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">{room.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sleeps up to {room.maxGuests}
            {room.sizeSqm ? ` · ${room.sizeSqm} m²` : ""}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{room.description}</p>

          {room.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="font-medium text-foreground">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        {/* Booking card */}
        <Reveal>
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            <p className="font-display text-2xl font-medium text-foreground">
              RWF {Number(room.basePrice).toLocaleString()}
              <span className="text-base font-normal text-muted-foreground"> / night</span>
            </p>
            <Link
              href={`/book?room=${room.slug}`}
              className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
            >
              Check Availability
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You won&apos;t be charged yet.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}