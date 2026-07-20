// src/app/(staff)/dashboard/rooms/room-type-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/shared/cloudinary-upload";
import { createRoomType, updateRoomType } from "@/server/actions/rooms";
import type { roomTypes as roomTypesTable } from "@/server/schema";

type RoomType = typeof roomTypesTable.$inferSelect;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function RoomTypeDialog({
  roomType,
  onClose,
}: {
  roomType: RoomType | null;
  onClose: () => void;
}) {
  const isEditing = Boolean(roomType);

  const [name, setName] = useState(roomType?.name ?? "");
  const [slug, setSlug] = useState(roomType?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [description, setDescription] = useState(roomType?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    roomType?.basePrice ? String(roomType.basePrice) : ""
  );
  const [maxGuests, setMaxGuests] = useState(
    roomType?.maxGuests ? String(roomType.maxGuests) : "2"
  );
  const [sizeSqm, setSizeSqm] = useState(
    roomType?.sizeSqm ? String(roomType.sizeSqm) : ""
  );
  const [amenities, setAmenities] = useState(
    roomType?.amenities?.join(", ") ?? ""
  );
  const [images, setImages] = useState<string[]>(roomType?.imagePublicIds ?? []);
  const [isPublished, setIsPublished] = useState(roomType?.isPublished ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit() {
    setIsSaving(true);
    setError(null);

    const payload = {
      name,
      slug,
      description,
      basePrice,
      maxGuests,
      sizeSqm: sizeSqm || null,
      amenities: amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      imagePublicIds: images,
      isPublished,
    };

    const result = isEditing
      ? await updateRoomType({ id: roomType!.id, ...payload })
      : await createRoomType(payload);

    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>{isEditing ? "Edit room type" : "New room type"}</DialogTitle>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Deluxe King"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="deluxe-king"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Base rate (USD)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max guests</label>
              <Input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Size (m²)</label>
              <Input
                type="number"
                min="0"
                value={sizeSqm}
                onChange={(e) => setSizeSqm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Amenities (comma-separated)
            </label>
            <Input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="Free WiFi, Minibar, City view"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Photos</label>
            <CloudinaryUpload value={images} onChange={setImages} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Published on public site
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}