import type { Metadata } from "next";
import { listGalleryImages } from "@/server/db/queries/gallery";
import { Reveal } from "@/components/public/reveal";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look inside Baobab Hotel — rooms, dining, and the grounds in Kigali, Rwanda.",
};

export default async function GalleryPage() {
  const images = await listGalleryImages();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Gallery</p>
        <h1 className="font-display mt-2 text-4xl font-medium text-foreground sm:text-5xl">See Baobab Hotel</h1>
        <p className="mt-4 text-muted-foreground">
          Rooms, dining, the grounds, and moments from our guests&apos; stays.
        </p>
      </Reveal>

      <div className="mt-12">
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}