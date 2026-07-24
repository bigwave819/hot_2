import type { Metadata } from "next";
import Image from "next/image";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { listGalleryImages } from "@/server/db/queries/gallery";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Baobab Hotel, Kigali, Rwanda.",
};

export default async function AboutPage() {
  const aboutBlock = getContentBlock("about.page")!;
  const [about, galleryImages] = await Promise.all([
    getSiteContentValue("about.page", aboutBlock.defaultValue),
    listGalleryImages(),
  ]);

  const exteriorPhotos = galleryImages.filter((img) => img.category === "exterior").slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">About</p>
        <h1 className="font-display mt-2 text-4xl font-medium text-foreground sm:text-5xl">{about.heading}</h1>
        <p className="mt-6 leading-relaxed whitespace-pre-line text-muted-foreground">{about.body}</p>
      </Reveal>

      {exteriorPhotos.length > 0 && (
        <Reveal delay={0.1} className="mt-12 grid grid-cols-3 gap-4">
          {exteriorPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-4/3 overflow-hidden rounded-lg bg-secondary">
              <Image
                src={cloudinaryRawUrl(photo.cloudinaryPublicId)}
                alt={photo.caption ?? "Baobab Hotel"}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </Reveal>
      )}
    </div>
  );
}