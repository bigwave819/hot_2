"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { createReservation } from "@/server/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicRoomType } from "@/server/db/queries/public-rooms";
import type { HotelSettingsInput } from "@/lib/validation/settings";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function formatNights(n: number) {
  return `${n} night${n > 1 ? "s" : ""}`;
}

const fieldLabelClass = "text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase";

export function BookingForm({ room, settings }: { room: PublicRoomType; settings: HotelSettingsInput }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = React.useState(todayISO());
  const [checkOut, setCheckOut] = React.useState(addDays(todayISO(), 1));
  const [numGuests, setNumGuests] = React.useState(1);
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000),
  );
  const subtotal = nights * Number(room.basePrice);
  const tax = subtotal * (settings.taxRatePercent / 100);
  const total = subtotal + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setIsSubmitting(true);
    const result = await createReservation({
      roomTypeId: room.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numGuests,
      specialRequests: specialRequests || undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(`/bookings/${result.data.reservationId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkIn" className={fieldLabelClass}>
            Check-in
          </Label>
          <Input
            id="checkIn"
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1));
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkOut" className={fieldLabelClass}>
            Check-out
          </Label>
          <Input
            id="checkOut"
            type="date"
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="numGuests" className={fieldLabelClass}>
          Guests
        </Label>
        <div className="relative">
          <Users className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            id="numGuests"
            value={numGuests}
            onChange={(e) => setNumGuests(Number(e.target.value))}
            className="border-input h-10 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="specialRequests" className={fieldLabelClass}>
          Special requests <span className="normal-case">(optional)</span>
        </Label>
        <Textarea
          id="specialRequests"
          placeholder="Late check-in, high floor, dietary needs…"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            {formatNights(nights)} × RWF {Number(room.basePrice).toLocaleString()}
          </span>
          <span>RWF {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax ({settings.taxRatePercent}%)</span>
          <span>RWF {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
          <span>Total</span>
          <span className="font-display text-lg">
            RWF {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Submitting…" : "Request Reservation"}
      </Button>
      <p className="-mt-2 text-center text-xs text-muted-foreground">
        This sends a reservation request — payment is handled at the hotel, not online.
      </p>
    </form>
  );
}