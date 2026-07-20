"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { addGalleryImages } from "@/server/actions/gallery";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: "rooms", label: "Rooms" },
  { value: "restaurant", label: "Restaurant" },
  { value: "exterior", label: "Exterior" },
  { value: "amenities", label: "Amenities" },
  { value: "events", label: "Events" },
] as const;

export function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]["value"]>("rooms");
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setFiles([]);
    setError(null);
    setCategory("rooms");
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("Choose at least one photo.");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const publicIds = await Promise.all(files.map((file) => uploadImageToCloudinary(file, "baobab-hotel/gallery")));
      const result = await addGalleryImages({
        category,
        images: publicIds.map((cloudinaryPublicId) => ({ cloudinaryPublicId })),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      reset();
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Upload failed. Check your Cloudinary configuration and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add photos</DialogTitle>
          <DialogDescription>Upload one or more photos to a gallery category.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="gallery-category">Category</Label>
            <select
              id="gallery-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number]["value"])}
              className="border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Photos</Label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border-input rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground hover:bg-secondary"
            >
              {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Click to choose photos"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}