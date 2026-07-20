"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { format } from "date-fns";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CreateStaffDialog } from "./create-staff-dialog";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateUserRole, setUserActive } from "@/server/actions/users";
import type { StaffUserRow } from "@/server/db/queries/users";

type PendingAction =
  | { type: "toggle-active"; user: StaffUserRow }
  | { type: "change-role"; user: StaffUserRow; role: "receptionist" | "admin" };

export function UsersTable({ users, currentUserId }: { users: StaffUserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [pending, setPending] = React.useState<PendingAction | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    if (!pending) return;
    setIsConfirming(true);
    setError(null);

    const result =
      pending.type === "toggle-active"
        ? await setUserActive(pending.user.id, !pending.user.isActive)
        : await updateUserRole({ userId: pending.user.id, role: pending.role });

    setIsConfirming(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setPending(null);
    router.refresh();
  }

  const columns: DataTableColumn<StaffUserRow>[] = [
    {
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">
            {row.name}
            {row.id === currentUserId && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { header: "Role", cell: (row) => <RoleBadge role={row.role} /> },
    {
      header: "Status",
      cell: (row) => <Badge variant={row.isActive ? "success" : "destructive"}>{row.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { header: "Joined", cell: (row) => format(new Date(row.createdAt), "MMM d, yyyy") },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPending({
                type: "change-role",
                user: row,
                role: row.role === "admin" ? "receptionist" : "admin",
              })
            }
          >
            Make {row.role === "admin" ? "Receptionist" : "Admin"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPending({ type: "toggle-active", user: row })}
          >
            {row.isActive ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Create staff account
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        getRowId={(row) => row.id}
        emptyTitle="No staff accounts yet"
        emptyDescription="Create your first receptionist or admin account to get started."
        emptyAction={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create staff account
          </Button>
        }
      />

      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onOpenChange={(open) => !open && setPending(null)}
          title={
            pending.type === "toggle-active"
              ? pending.user.isActive
                ? "Deactivate account?"
                : "Reactivate account?"
              : `Change role to ${pending.role}?`
          }
          description={
            pending.type === "toggle-active"
              ? pending.user.isActive
                ? `${pending.user.name} will no longer be able to sign in. Their history is kept.`
                : `${pending.user.name} will be able to sign in again.`
              : `${pending.user.name} will have ${pending.role} permissions.`
          }
          confirmLabel={pending.type === "toggle-active" && pending.user.isActive ? "Deactivate" : "Confirm"}
          variant={pending.type === "toggle-active" && pending.user.isActive ? "destructive" : "default"}
          onConfirm={handleConfirm}
          isConfirming={isConfirming}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}