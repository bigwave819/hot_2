"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markPaymentPaid } from "@/server/actions/payments";
import type { PaymentRow } from "@/server/db/queries/payments";

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile Money",
};

const TABS: { value: "all" | "pending" | "paid"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

export function PaymentsTable({ payments, currency }: { payments: PaymentRow[]; currency: string }) {
  const router = useRouter();
  const [markingPaid, setMarkingPaid] = React.useState<string | null>(null);

  async function handleMarkPaid(id: string) {
    setMarkingPaid(id);
    await markPaymentPaid(id);
    setMarkingPaid(null);
    router.refresh();
  }

  const columns: DataTableColumn<PaymentRow>[] = [
    {
      header: "Guest",
      cell: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.reservation.guest.name}</p>
          <p className="text-xs text-muted-foreground">{p.reservation.room.roomType.name}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (p) => (
        <span className="font-medium text-foreground">
          {currency} {Number(p.amount).toLocaleString()}
        </span>
      ),
    },
    { header: "Method", cell: (p) => METHOD_LABEL[p.method] },
    {
      header: "Status",
      cell: (p) => <Badge variant={p.status === "paid" ? "success" : "warning"}>{p.status === "paid" ? "Paid" : "Pending"}</Badge>,
    },
    { header: "Recorded By", cell: (p) => p.recordedByStaff.name },
    { header: "Date", cell: (p) => format(new Date(p.createdAt), "MMM d, yyyy") },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) =>
        p.status === "pending" ? (
          <Button size="sm" onClick={() => handleMarkPaid(p.id)} disabled={markingPaid === p.id}>
            {markingPaid === p.id ? "Saving…" : "Mark as Paid"}
          </Button>
        ) : null,
    },
  ];

  return (
    <Tabs defaultValue="all">
      <TabsList>
        {TABS.map((tab) => {
          const count = tab.value === "all" ? payments.length : payments.filter((p) => p.status === tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{count}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <DataTable
            columns={columns}
            data={tab.value === "all" ? payments : payments.filter((p) => p.status === tab.value)}
            getRowId={(p) => p.id}
            emptyTitle="No payments here"
            emptyDescription="Record a payment from the Reservations page."
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}