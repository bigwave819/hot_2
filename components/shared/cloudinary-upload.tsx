"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { X, Upload, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadProps {
  value: string[];
  onChange: (publicIds: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function CloudinaryUpload({
  value,
  onChange,
  maxImages = 8,
  disabled,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET!);
      formData.append("folder", "baobab-hotel/room-types");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Upload failed");
      }

      const data = await res.json();
      return data.public_id as string;
    },
    []
  );

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images reached`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(toUpload.map(uploadFile));
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(publicId: string) {
    onChange(value.filter((id) => id !== publicId));
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        <ImageOff className="size-4 shrink-0" />
        Image upload isn&apos;t configured yet — set
        <code className="rounded bg-secondary px-1 py-0.5 text-xs">
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        </code>
        in your environment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((publicId) => (
          <div
            key={publicId}
            className="group relative aspect-square overflow-hidden rounded-md border border-border bg-secondary"
          >
            <Image
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_200,q_auto,f_auto/${publicId}`}
              alt=""
              fill
              className="object-cover"
              sizes="200px"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeImage(publicId)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}

        {!disabled && value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            <Upload className="size-4" />
            {isUploading ? "Uploading…" : "Add photo"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxImages} images
      </p>
    </div>
  );
}