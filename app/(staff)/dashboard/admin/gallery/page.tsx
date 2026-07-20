import type { Metadata } from "next";
import { requireRole } from "@/server/auth/session";
import { listGalleryImages } from "@/server/db/queries/gallery";
import { PageHeader } from "@/components/shared/page-header";
import { GalleryManager } from "./gallery-manager";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  await requireRole(["admin"]);
  const images = await listGalleryImages();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gallery" description="Photos shown on the public site's gallery page." />
      <GalleryManager images={images} />
    </div>
  );
}