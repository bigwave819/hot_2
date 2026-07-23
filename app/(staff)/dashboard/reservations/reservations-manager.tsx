"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CancelDialog } from "./cancel-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmReservation, checkInReservation, checkOutReservation } from "@/server/actions/reservations";
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_VARIANT, type ReservationStatus } from "@/lib/reservation-status";
import type { StaffReservationRow } from "@/server/db/queries/reservations";

const TABS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

type PendingAction = { type: "confirm" | "check_in" | "check_out"; reservation: StaffReservationRow };

export function ReservationsManager({ reservations }: { reservations: StaffReservationRow[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<PendingAction | null>(null);
  const [cancelling, setCancelling] = React.useState<StaffReservationRow | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirmAction() {
    if (!pending) return;
    setIsConfirming(true);
    setError(null);

    try {
      const result =
        pending.type === "confirm"
          ? await confirmReservation(pending.reservation.id)
          : pending.type === "check_in"
            ? await checkInReservation(pending.reservation.id)
            : await checkOutReservation(pending.reservation.id);

      if (!result.success) {
        setError(result.error);
        return;
      }
      setPending(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  }

  const columns: DataTableColumn<StaffReservationRow>[] = [
    {
      header: "Guest",
      cell: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.guest.name}</p>
          <p className="text-xs text-muted-foreground">{r.guest.email}</p>
        </div>
      ),
    },
    {
      header: "Room",
      cell: (r) => (
        <div>
          <p>{r.room.roomType.name}</p>
          <p className="text-xs text-muted-foreground">Room {r.room.roomNumber}</p>
        </div>
      ),
    },
    {
      header: "Dates",
      cell: (r) => (
        <span>
          {format(new Date(r.checkInDate), "MMM d")} → {format(new Date(r.checkOutDate), "MMM d, yyyy")}
        </span>
      ),
    },
    { header: "Guests", cell: (r) => r.numGuests },
    {
      header: "Status",
      cell: (r) => <Badge variant={RESERVATION_STATUS_VARIANT[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>,
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          {r.status === "pending" && (
            <>
              <Button size="sm" onClick={() => setPending({ type: "confirm", reservation: r })}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCancelling(r)}>
                Cancel
              </Button>
            </>
          )}
          {r.status === "confirmed" && (
            <>
              <Button size="sm" onClick={() => setPending({ type: "check_in", reservation: r })}>
                Check In
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCancelling(r)}>
                Cancel
              </Button>
            </>
          )}
          {r.status === "checked_in" && (
            <Button size="sm" onClick={() => setPending({ type: "check_out", reservation: r })}>
              Check Out
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          {TABS.map((tab) => {
            const count =
              tab.value === "all" ? reservations.length : reservations.filter((r) => r.status === tab.value).length;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              columns={columns}
              data={tab.value === "all" ? reservations : reservations.filter((r) => r.status === tab.value)}
              getRowId={(r) => r.id}
              emptyTitle="No reservations here"
              emptyDescription="They'll show up once guests book, or as their status changes."
            />
          </TabsContent>
        ))}
      </Tabs>

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onOpenChange={(open) => !open && setPending(null)}
          title={
            pending.type === "confirm"
              ? "Confirm this reservation?"
              : pending.type === "check_in"
                ? "Check in this guest?"
                : "Check out this guest?"
          }
          description={
            pending.type === "confirm"
              ? `${pending.reservation.guest.name}'s reservation will be marked confirmed.`
              : pending.type === "check_in"
                ? `Room ${pending.reservation.room.roomNumber} will be marked occupied.`
                : `Room ${pending.reservation.room.roomNumber} will be marked as needing cleaning.`
          }
          confirmLabel={
            pending.type === "confirm" ? "Confirm" : pending.type === "check_in" ? "Check In" : "Check Out"
          }
          onConfirm={handleConfirmAction}
          isConfirming={isConfirming}
        />
      )}

      {cancelling && (
        <CancelDialog
          open={!!cancelling}
          onOpenChange={(open) => !open && setCancelling(null)}
          reservationId={cancelling.id}
          onCancelled={() => {
            setCancelling(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}