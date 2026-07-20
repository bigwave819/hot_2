import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { siteContent } from "@/server/schema";

export async function listSiteContent() {
  return db.select().from(siteContent);
}
export type SiteContentRow = Awaited<ReturnType<typeof listSiteContent>>[number];

export async function getSiteContentValue<T extends Record<string, string>>(
  key: string,
  defaultValue: T,
): Promise<T> {
  const [row] = await db.select().from(siteContent).where(eq(siteContent.key, key));
  if (!row) return defaultValue;
  return { ...defaultValue, ...(row.value as Partial<T>) };
}