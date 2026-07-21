"use client";

import * as React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { createMenuItem, updateMenuItem } from "@/server/actions/menu";
import { menuItemSchema, type MenuItemInput } from "@/lib/validation/menu";
import { uploadImageToCloudinary, cloudinaryUrl } from "@/lib/cloudinary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { MenuItemRow } from "@/server/db/queries/menu";

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  categories,
  defaultCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItemRow;
  categories: string[];
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    values: {
      name: item?.name ?? "",
      description: item?.description ?? "",
      price: item ? Number(item.price) : 0,
      category: item?.category ?? defaultCategory ?? "",
      cloudinaryPublicId: item?.cloudinaryPublicId ?? undefined,
      isAvailable: item?.isAvailable ?? true,
    },
  });

  async function onSubmit(values: MenuItemInput) {
    setServerError(null);
    const result = item ? await updateMenuItem(item.id, values) : await createMenuItem(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset();
    onOpenChange(false);
    router.refresh();
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
          <DialogTitle>{item ? "Edit menu item" : "Add menu item"}</DialogTitle>
          <DialogDescription>Shown on the public restaurant page when available.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Controller
            control={control}
            name="cloudinaryPublicId"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label>Photo (optional)</Label>
                {field.value ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-md border border-border">
                    <Image src={cloudinaryUrl(field.value)} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => field.onChange(undefined)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="border-input flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    <span className="text-xs">{isUploading ? "Uploading…" : "Add photo"}</span>
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const publicId = await uploadImageToCloudinary(file, "baobab-hotel/menu");
                      field.onChange(publicId);
                    } catch {
                      setServerError("Photo upload failed. Please try again.");
                    } finally {
                      setIsUploading(false);
                      if (inputRef.current) inputRef.current.value = "";
                    }
                  }}
                />
              </div>
            )}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="menu-name">Name</Label>
            <Input id="menu-name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="menu-description">Description</Label>
            <Textarea id="menu-description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-price">Price</Label>
              <Input
                id="menu-price"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="menu-category">Category</Label>
              <Input
                id="menu-category"
                list="menu-categories"
                placeholder="e.g. Mains"
                aria-invalid={!!errors.category}
                {...register("category")}
              />
              <datalist id="menu-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <Controller
            control={control}
            name="isAvailable"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="menu-available" className="font-normal">
                  Available on the menu
                </Label>
                <Switch
                  aria-label="Available on the menu"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving…" : item ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
