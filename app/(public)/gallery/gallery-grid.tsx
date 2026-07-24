"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { cloudinaryRawUrl } from "@/lib/cloudinary";
import type { GalleryImageRow } from "@/server/db/queries/gallery";

const CATEGORIES: { value: GalleryImageRow["category"]; label: string }[] = [
  { value: "rooms", label: "Rooms" },
  { value: "restaurant", label: "Restaurant" },
  { value: "exterior", label: "Exterior" },
  { value: "amenities", label: "Amenities" },
  { value: "events", label: "Events" },
];

function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImageRow[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNavigate]);

  if (!mounted) return null;

  const image = images[index];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate((index - 1 + images.length) % images.length)}
        aria-label="Previous photo"
        className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="relative h-[80vh] w-full max-w-4xl">
        <Image src={cloudinaryRawUrl(image.cloudinaryPublicId)} alt={image.caption ?? ""} fill className="object-contain" />
      </div>
      <button
        type="button"
        onClick={() => onNavigate((index + 1) % images.length)}
        aria-label="Next photo"
        className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {image.caption && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">{image.caption}</p>
      )}
    </div>,
    document.body,
  );
}

export function GalleryGrid({ images }: { images: GalleryImageRow[] }) {
  const [lightbox, setLightbox] = React.useState<{ category: GalleryImageRow["category"]; index: number } | null>(null);

  return (
    <>
      <Tabs defaultValue="rooms">
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => {
          const categoryImages = images.filter((img) => img.category === c.value);
          return (
            <TabsContent key={c.value} value={c.value}>
              {categoryImages.length === 0 ? (
                <EmptyState title={`No ${c.label.toLowerCase()} photos yet`} />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {categoryImages.map((image, i) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setLightbox({ category: c.value, index: i })}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
                    >
                      <Image
                        src={cloudinaryRawUrl(image.cloudinaryPublicId)}
                        alt={image.caption ?? ""}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {lightbox &&
        (() => {
          const categoryImages = images.filter((img) => img.category === lightbox.category);
          return (
            <Lightbox
              images={categoryImages}
              index={lightbox.index}
              onClose={() => setLightbox(null)}
              onNavigate={(index) => setLightbox({ category: lightbox.category, index })}
            />
          );
        })()}
    </>
  );
}