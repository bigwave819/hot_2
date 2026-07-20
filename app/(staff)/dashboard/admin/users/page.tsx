import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listStaffUsers } from "@/server/db/queries/users";
import { PageHeader } from "@/components/shared/page-header";
import { UsersTable } from "./users-table";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const currentUser = await requireRole(["admin"]);
  const staffUsers = await listStaffUsers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage receptionist and admin accounts. Guests register themselves and appear under Guests."
      />
      <UsersTable users={staffUsers} currentUserId={currentUser.id} />
    </div>
  );
}