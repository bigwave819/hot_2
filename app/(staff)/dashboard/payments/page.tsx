import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listAllPayments } from "@/server/db/queries/payments";
import { getHotelSettings } from "@/server/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentsTable } from "./payments-table";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  await requireRole(["receptionist", "admin"]);
  const [payments, settings] = await Promise.all([listAllPayments(), getHotelSettings()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="All recorded payments across reservations." />
      <PaymentsTable payments={payments} currency={settings.currency} />
    </div>
  );
}