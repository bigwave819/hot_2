"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createWalkInGuest } from "@/server/actions/guests";
import { createWalkInGuestSchema, type CreateWalkInGuestInput } from "@/lib/validation/guests";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateWalkInDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWalkInGuestInput>({ resolver: zodResolver(createWalkInGuestSchema) });

  async function onSubmit(values: CreateWalkInGuestInput) {
    setServerError(null);
    const result = await createWalkInGuest(values);
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
          <DialogTitle>Add walk-in guest</DialogTitle>
          <DialogDescription>
            For guests booked in person. They can request online access later if they ever want it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="walkin-name">Full name</Label>
              <Input id="walkin-name" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="walkin-email">Email</Label>
              <Input id="walkin-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="walkin-phone">Phone</Label>
              <Input id="walkin-phone" {...register("phone")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="walkin-nationality">Nationality</Label>
              <Input id="walkin-nationality" {...register("nationality")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}