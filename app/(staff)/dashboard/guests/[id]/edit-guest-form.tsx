"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateGuest } from "@/server/actions/guests";
import { guestProfileSchema, type GuestProfileInput } from "@/lib/validation/guests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GuestDetail } from "@/server/db/queries/guests";

export function GuestEditForm({ guest }: { guest: NonNullable<GuestDetail> }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GuestProfileInput>({
    resolver: zodResolver(guestProfileSchema),
    values: {
      name: guest.name,
      phone: guest.profile?.phone ?? "",
      nationality: guest.profile?.nationality ?? "",
      dateOfBirth: guest.profile?.dateOfBirth ?? "",
      address: guest.profile?.address ?? "",
      notes: guest.profile?.notes ?? "",
    },
  });

  async function onSubmit(values: GuestProfileInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateGuest(guest.id, values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
    >
      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      {saved && !isDirty && (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Saved.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="guest-name">Full name</Label>
        <Input id="guest-name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-phone">Phone</Label>
          <Input id="guest-phone" {...register("phone")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-nationality">Nationality</Label>
          <Input id="guest-nationality" {...register("nationality")} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guest-dob">Date of birth</Label>
        <Input id="guest-dob" type="date" className="max-w-xs" {...register("dateOfBirth")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guest-address">Address</Label>
        <Textarea id="guest-address" {...register("address")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guest-notes">Staff notes</Label>
        <Textarea id="guest-notes" placeholder="Preferences, dietary needs, incidents…" {...register("notes")} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}