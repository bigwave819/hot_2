import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Room status
  available: "bg-success/15 text-success",
  reserved: "bg-info/15 text-info",
  occupied: "bg-warning/15 text-warning",
  cleaning: "bg-accent/15 text-accent-foreground",
  maintenance: "bg-destructive/15 text-destructive",

  // Reservation status
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-info/15 text-info",
  checked_in: "bg-success/15 text-success",
  checked_out: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",

  // Payment status (adjust if your enum values differ)
  paid: "bg-success/15 text-success",
  partial: "bg-warning/15 text-warning",
  refunded: "bg-info/15 text-info",
  failed: "bg-destructive/15 text-destructive",
};

function formatLabel(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {formatLabel(status)}
    </span>
  );
}