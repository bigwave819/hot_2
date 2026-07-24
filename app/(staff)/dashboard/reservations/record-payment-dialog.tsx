"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/server/actions/payments";
import { recordPaymentSchema, type RecordPaymentInput } from "@/lib/validation/payments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "mobile_money", label: "Mobile Money" },
] as const;

export function RecordPaymentDialog({
  open,
  onOpenChange,
  reservationId,
  guestName,
  currency,
  amountDue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  guestName: string;
  currency: string;
  amountDue: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    values: {
      reservationId,
      amount: amountDue,
      method: "cash",
      status: "paid",
      notes: "",
    },
  });

  async function onSubmit(values: RecordPaymentInput) {
    setServerError(null);
    const result = await recordPayment(values);
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
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            For {guestName} · Amount due: {currency} {amountDue.toLocaleString()}
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
              <Label htmlFor="payment-amount">Amount ({currency})</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.amount}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="payment-method">Method</Label>
              <select
                id="payment-method"
                className="border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("method")}
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="payment-status">Status</Label>
                <select
                  id="payment-status"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="paid">Paid now</option>
                  <option value="pending">Pending (invoice / not yet collected)</option>
                </select>
              </div>
            )}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="payment-notes">Notes (optional)</Label>
            <Textarea id="payment-notes" placeholder="Deposit, balance, refund reference…" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}