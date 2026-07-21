import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { getHotelSettings } from "@/server/db/queries/settings";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireRole(["admin"]);
  const settings = await getHotelSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Hotel-wide operational settings." />
      <SettingsForm initialValues={settings} />
    </div>
  );
}
