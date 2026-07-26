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
import { SplitHeading } from "@/components/public/split-heading";
import { ParallaxLayer } from "@/components/public/parallax-layer";
import { HeroSignature } from "@/components/public/hero-signature";
import { editorialMedia, Hairline, CornerMark } from "@/components/public/editorial-marks";
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

      {/* Hero — the "why should I stay" moment. Three layered motion
          techniques: a slow continuous parallax on the photo, a drifting
          gold flare that never stops (see HeroSignature), and a
          word-by-word headline reveal on load. Nothing here waits for
          scroll — it's meant to read as alive within 2–3 seconds. */}
      <section className="relative flex h-[85vh] min-h-140 items-end overflow-hidden">
        <div className="absolute inset-0">
          <ParallaxLayer speed={0.15} className="h-full w-full">
            <Image
              src="/homepage-hero.jpg"
              alt="Baobab Hotel exterior at dusk"
              fill
              priority
              className="object-cover"
            />
          </ParallaxLayer>
        </div>

        <HeroSignature />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <Reveal variant="fade-up">
            <p className="font-mono text-xs tracking-[0.2em] text-white/70 uppercase">{hero.eyebrow}</p>
          </Reveal>

          <SplitHeading trigger="load" by="words">
            <h1 className="font-display mt-3 max-w-3xl text-5xl leading-[1.05] font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
              {hero.headline}
            </h1>
          </SplitHeading>

          <Reveal variant="fade-up" delay={0.5}>
            <p className="mt-5 max-w-lg text-white/80">{hero.subheadline}</p>
            <Link href={hero.ctaHref} className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              {hero.ctaLabel}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SplitHeading trigger="scroll" by="words">
            <h2 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              {about.heading}
            </h2>
          </SplitHeading>
          <Reveal variant="fade-up" delay={0.15}>
            <p className="mt-5 text-muted-foreground">{about.body}</p>
          </Reveal>
        </div>
      </section>

      {/* Featured rooms */}
      {featuredRooms.length > 0 && (
        <section className="bg-secondary/30 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    Accommodation
                  </p>
                  <h2 className="font-display mt-2 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                    Featured Rooms
                  </h2>
                </div>
                <Link
                  href="/rooms"
                  className="hidden text-sm font-medium text-primary hover:underline sm:block"
                >
                  View all rooms →
                </Link>
              </div>
              <Hairline className="mt-8" />
            </Reveal>

            <Reveal stagger={0.12} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.slug}`} className="group block">
                  <div className={cn("relative aspect-4/3 bg-secondary", editorialMedia)}>
                    {room.imagePublicIds[0] ? (
                      <Image
                        src={cloudinaryRawUrl(room.imagePublicIds[0])}
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-(--duration-hover-slow) ease-(--ease-signature) group-hover:scale-105"
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
              ))}
            </Reveal>

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
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal stagger={0.15} className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Dining</p>
            <h2 className="font-display mt-2 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              {dining.heading}
            </h2>
            <p className="mt-5 text-muted-foreground">{dining.body}</p>
            <Link href="/dining" className={cn(buttonVariants({ variant: "hairline", size: "lg" }), "mt-6")}>
              Explore the Menu
            </Link>
          </div>
          <div className={cn("relative aspect-4/3 bg-secondary", editorialMedia)}>
            <CornerMark className="absolute top-3 left-3 z-10" />
          </div>
        </Reveal>
      </section>

      {/* Gallery preview */}
      {previewImages.length > 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-8">
              <h2 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                Gallery
              </h2>
            </Reveal>
            <Reveal stagger={0.08} variant="scale-in" className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {previewImages.map((img) => (
                <div key={img.id} className={cn("relative aspect-square", editorialMedia)}>
                  <Image
                    src={cloudinaryRawUrl(img.cloudinaryPublicId)}
                    alt={img.caption ?? "Baobab Hotel"}
                    fill
                    className="object-cover transition-transform duration-(--duration-hover) ease-(--ease-signature) hover:scale-105"
                  />
                </div>
              ))}
            </Reveal>
            <div className="mt-8 text-center">
              <Link href="/gallery" className="text-sm font-medium text-primary hover:underline">
                View full gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-primary py-24 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <SplitHeading trigger="scroll" by="words">
            <h2 className="font-display text-4xl font-medium tracking-tight text-primary-foreground sm:text-5xl">
              Ready to experience Baobab?
            </h2>
          </SplitHeading>
          <Reveal variant="fade-up" delay={0.2}>
            <Link
              href="/rooms"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-8")}
            >
              Book Your Stay
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}