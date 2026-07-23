"use client";

import * as React from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateWalkInDialog } from "./create-walkin-dialog";
import type { GuestListRow } from "@/server/db/queries/guests";

export function GuestsTable({ guests }: { guests: GuestListRow[] }) {
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);

  const filtered = guests.filter((g) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<GuestListRow>[] = [
    {
      header: "Guest",
      cell: (g) => (
        <Link href={`/dashboard/guests/${g.id}`} className="font-medium text-foreground hover:underline">
          {g.name}
        </Link>
      ),
    },
    { header: "Email", cell: (g) => <span className="text-muted-foreground">{g.email}</span> },
    { header: "Phone", cell: (g) => g.phone ?? <span className="text-muted-foreground">—</span> },
    { header: "Nationality", cell: (g) => g.nationality ?? <span className="text-muted-foreground">—</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add walk-in guest
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(g) => g.id}
        emptyTitle={search ? "No guests match your search" : "No guests yet"}
        emptyDescription={search ? undefined : "Guests appear here once they register or are added as a walk-in."}
      />

      <CreateWalkInDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}