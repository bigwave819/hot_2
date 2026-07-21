import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { settings } from "@/server/schema";
import { DEFAULT_HOTEL_SETTINGS, type HotelSettingsInput } from "@/lib/validation/settings";

const SETTINGS_KEY = "general";

export async function getHotelSettings(): Promise<HotelSettingsInput> {
  const [row] = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY));
  if (!row) return DEFAULT_HOTEL_SETTINGS;
  return { ...DEFAULT_HOTEL_SETTINGS, ...(row.value as Partial<HotelSettingsInput>) };
}

export { SETTINGS_KEY };
