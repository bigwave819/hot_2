import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listSiteContent } from "@/server/db/queries/content";
import { PageHeader } from "@/components/shared/page-header";
import { ContentBlocksList } from "./content-blocks-list";

export const metadata: Metadata = { title: "Website Content" };

export default async function ContentPage() {
  await requireRole(["admin"]);
  const rows = await listSiteContent();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Website Content"
        description="Edit the copy shown on the public site. Changes go live immediately."
      />
      <ContentBlocksList rows={rows} />
    </div>
  );
}