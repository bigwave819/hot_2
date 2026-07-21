import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listMenuItems } from "@/server/db/queries/menu";
import { PageHeader } from "@/components/shared/page-header";
import { MenuManager } from "./menu-manager";

export const metadata: Metadata = { title: "Restaurant Menu" };

export default async function MenuPage() {
  await requireRole(["admin"]);
  const items = await listMenuItems();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Restaurant Menu" description="Manage the menu shown on the public dining page." />
      <MenuManager items={items} />
    </div>
  );
}
