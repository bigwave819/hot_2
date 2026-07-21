"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateHotelSettings } from "@/server/actions/settings";
import { hotelSettingsSchema, type HotelSettingsInput } from "@/lib/validation/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initialValues }: { initialValues: HotelSettingsInput }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HotelSettingsInput>({
    resolver: zodResolver(hotelSettingsSchema),
    values: initialValues,
  });

  async function onSubmit(values: HotelSettingsInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateHotelSettings(values);
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
      className="flex max-w-lg flex-col gap-5 rounded-lg border border-border bg-card p-6"
    >
      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      {saved && !isDirty && (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Settings saved.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkInTime">Check-in time</Label>
          <Input
            id="checkInTime"
            type="time"
            aria-invalid={!!errors.checkInTime}
            {...register("checkInTime")}
          />
          {errors.checkInTime && <p className="text-sm text-destructive">{errors.checkInTime.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="checkOutTime">Check-out time</Label>
          <Input
            id="checkOutTime"
            type="time"
            aria-invalid={!!errors.checkOutTime}
            {...register("checkOutTime")}
          />
          {errors.checkOutTime && <p className="text-sm text-destructive">{errors.checkOutTime.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency code</Label>
          <Input
            id="currency"
            maxLength={3}
            className="uppercase"
            aria-invalid={!!errors.currency}
            {...register("currency")}
          />
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="taxRatePercent">Tax rate (%)</Label>
          <Input
            id="taxRatePercent"
            type="number"
            step="0.1"
            min="0"
            max="100"
            aria-invalid={!!errors.taxRatePercent}
            {...register("taxRatePercent", { valueAsNumber: true })}
          />
          {errors.taxRatePercent && <p className="text-sm text-destructive">{errors.taxRatePercent.message}</p>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Used for reservation pricing and check-in/out display once the booking flow is built.
      </p>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
