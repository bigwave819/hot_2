import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listGuests } from "@/server/db/queries/guests";
import { PageHeader } from "@/components/shared/page-header";
import { GuestsTable } from "./guests-table";

export const metadata: Metadata = { title: "Guests" };

export default async function GuestsPage() {
  await requireRole(["receptionist", "admin"]);
  const guests = await listGuests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Guests"
        description="Registered guests and their contact details."
      />
      <GuestsTable guests={guests} />
    </div>
  );
}