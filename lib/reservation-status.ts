import type { reservationStatusEnum } from "@/server/schema/enums";

export type ReservationStatus = (typeof reservationStatusEnum.enumValues)[number];

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export const RESERVATION_STATUS_VARIANT: Record<
  ReservationStatus,
  "default" | "success" | "warning" | "destructive" | "info"
> = {
  pending: "warning",
  confirmed: "success",
  checked_in: "info",
  checked_out: "default",
  cancelled: "destructive",
};

/**
 * The reservation state machine. Enforced both here (for UI — which
 * action buttons to show) and independently in the server actions (never
 * trust the client alone for a state transition).
 */
const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
};

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}