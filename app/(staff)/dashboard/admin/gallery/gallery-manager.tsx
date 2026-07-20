"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UploadDialog } from "./upload-dialog";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { updateGalleryImageCaption, reorderGalleryImage, deleteGalleryImage } from "@/server/actions/gallery";
import type { GalleryImageRow } from "@/server/db/queries/gallery";

const CATEGORIES: { value: GalleryImageRow["category"]; label: string }[] = [
  { value: "rooms", label: "Rooms" },
  { value: "restaurant", label: "Restaurant" },
  { value: "exterior", label: "Exterior" },
  { value: "amenities", label: "Amenities" },
  { value: "events", label: "Events" },
];

function ImageCard({ image }: { image: GalleryImageRow }) {
  const router = useRouter();
  const [caption, setCaption] = React.useState(image.caption ?? "");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function saveCaption() {
    if (caption === (image.caption ?? "")) return;
    await updateGalleryImageCaption(image.id, caption);
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    await deleteGalleryImage(image.id);
    setIsDeleting(false);
    setConfirmDelete(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-2">
      <div className="relative aspect-4/3 overflow-hidden rounded-md bg-secondary">
        <Image
          src={cloudinaryUrl(image.cloudinaryPublicId)}
          alt={image.caption ?? ""}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={saveCaption}
        placeholder="Caption (optional)"
        className="h-8 text-xs"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Move earlier"
            onClick={async () => {
              await reorderGalleryImage(image.id, "up");
              router.refresh();
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Move later"
            onClick={async () => {
              await reorderGalleryImage(image.id, "down");
              router.refresh();
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive h-7 w-7"
          aria-label="Delete photo"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this photo?"
        description="This removes it from the public gallery and deletes the file from storage. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
}

export function GalleryManager({ images }: { images: GalleryImageRow[] }) {
  const [uploadOpen, setUploadOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add photos
        </Button>
      </div>

      <Tabs defaultValue="rooms">
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
              <span className="ml-1.5 text-muted-foreground">
                ({images.filter((img) => img.category === c.value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => {
          const categoryImages = images.filter((img) => img.category === c.value);
          return (
            <TabsContent key={c.value} value={c.value}>
              {categoryImages.length === 0 ? (
                <EmptyState
                  title={`No ${c.label.toLowerCase()} photos yet`}
                  description="Add some to show them on the public gallery page."
                  action={
                    <Button onClick={() => setUploadOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add photos
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {categoryImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}