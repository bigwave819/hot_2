"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cancelReservation } from "@/server/actions/reservations";

export function CancelDialog({
  open,
  onOpenChange,
  reservationId,
  onCancelled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  onCancelled: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    const result = await cancelReservation(reservationId, reason);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setReason("");
    onOpenChange(false);
    onCancelled();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this reservation?</DialogTitle>
          <DialogDescription>The guest will need to book again if they still want to stay.</DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="cancel-reason">Reason (optional)</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Guest requested cancellation, no-show, etc."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Keep Reservation
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Cancelling…" : "Cancel Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}