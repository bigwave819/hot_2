import type { Metadata } from "next";
import { listMenuItems } from "@/server/db/queries/menu";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { getHotelSettings } from "@/server/db/queries/settings";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Dining",
  description: "Rwandan and international flavors at Baobab Hotel's restaurant in Kigali.",
};

export default async function DiningPage() {
  const diningBlock = getContentBlock("homepage.dining")!;
  const [items, dining, settings] = await Promise.all([
    listMenuItems(),
    getSiteContentValue("homepage.dining", diningBlock.defaultValue),
    getHotelSettings(),
  ]);

  const available = items.filter((i) => i.isAvailable);
  const categories = Array.from(new Set(available.map((i) => i.category)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Dining</p>
        <h1 className="font-display mt-2 text-4xl font-medium text-foreground sm:text-5xl">{dining.heading}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{dining.body}</p>
      </Reveal>

      {categories.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Our menu is being updated — check back shortly.</p>
      ) : (
        <div className="mt-16 flex flex-col gap-14">
          {categories.map((category) => (
            <Reveal key={category}>
              <h2 className="font-display border-b border-border pb-3 text-2xl font-medium text-foreground">
                {category}
              </h2>
              <div className="mt-6 flex flex-col gap-6">
                {available
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <div key={item.id} className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <p className="font-display shrink-0 text-foreground">
                        {settings.currency} {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}