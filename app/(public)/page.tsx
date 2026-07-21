import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { listPublishedRoomTypes } from "@/server/db/queries/public-rooms";
import { listGalleryImages } from "@/server/db/queries/gallery";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Baobab Hotel — Luxury Hotel in Kigali, Rwanda",
  description:
    "A modern sanctuary in the heart of Kigali. Book rooms, explore dining, and experience refined Rwandan hospitality at Baobab Hotel.",
  openGraph: {
    title: "Baobab Hotel — Kigali, Rwanda",
    description: "Rwandan hospitality, refined. Book your stay at Baobab Hotel.",
    type: "website",
  },
};

export default async function HomePage() {
  const heroBlock = getContentBlock("homepage.hero")!;
  const aboutBlock = getContentBlock("homepage.about")!;
  const diningBlock = getContentBlock("homepage.dining")!;

  const [hero, about, dining, featuredRooms, galleryImages] = await Promise.all([
    getSiteContentValue("homepage.hero", heroBlock.defaultValue),
    getSiteContentValue("homepage.about", aboutBlock.defaultValue),
    getSiteContentValue("homepage.dining", diningBlock.defaultValue),
    listPublishedRoomTypes(3),
    listGalleryImages(),
  ]);

  const previewImages = galleryImages.slice(0, 4);

  return (
    <>
      {/* JSON-LD structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: "Baobab Hotel",
            description: hero.subheadline,
            address: {
              "@type": "PostalAddress",
              streetAddress: "KG 7 Ave",
              addressLocality: "Kigali",
              addressCountry: "RW",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative flex h-[85vh] min-h-140 items-end overflow-hidden">
        <Image
          src="/images/homepage-hero.jpg"
          alt="Baobab Hotel exterior at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.2em] text-white/70 uppercase">{hero.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-2xl text-4xl leading-tight font-medium text-white sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-4 max-w-lg text-white/80">{hero.subheadline}</p>
          <Link href={hero.ctaHref} className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            {hero.ctaLabel}
          </Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">{about.heading}</h2>
          <p className="mt-4 text-muted-foreground">{about.body}</p>
        </Reveal>
      </section>

      {/* Featured rooms */}
      {featuredRooms.length > 0 && (
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-10 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Accommodation
                </p>
                <h2 className="font-display mt-2 text-3xl font-medium text-foreground sm:text-4xl">
                  Featured Rooms
                </h2>
              </div>
              <Link href="/rooms" className="hidden text-sm font-medium text-primary hover:underline sm:block">
                View all rooms →
              </Link>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room, i) => (
                <Reveal key={room.id} delay={i * 0.1}>
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
                    <div className="mt-4 flex items-baseline justify-between">
                      <h3 className="font-display text-lg font-medium text-foreground">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        RWF {Number(room.basePrice).toLocaleString()}/night
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{room.description}</p>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Link
              href="/rooms"
              className="mt-8 block text-center text-sm font-medium text-primary hover:underline sm:hidden"
            >
              View all rooms →
            </Link>
          </div>
        </section>
      )}

      {/* Dining teaser */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Dining</p>
            <h2 className="font-display mt-2 text-3xl font-medium text-foreground sm:text-4xl">
              {dining.heading}
            </h2>
            <p className="mt-4 text-muted-foreground">{dining.body}</p>
            <Link href="/dining" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
              Explore the Menu
            </Link>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-secondary" />
        </Reveal>
      </section>

      {/* Gallery preview */}
      {previewImages.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-8">
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">Gallery</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {previewImages.map((img, i) => (
                <Reveal key={img.id} delay={i * 0.08} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={cloudinaryRawUrl(img.cloudinaryPublicId)}
                    alt={img.caption ?? "Baobab Hotel"}
                    fill
                    className="object-cover"
                  />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/gallery" className="text-sm font-medium text-primary hover:underline">
                View full gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-primary py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-medium text-primary-foreground sm:text-4xl">
            Ready to experience Baobab?
          </h2>
          <Link
            href="/rooms"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-6")}
          >
            Book Your Stay
          </Link>
        </Reveal>
      </section>
    </>
  );
}