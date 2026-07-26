import type { Metadata } from "next";
import { listMenuItems } from "@/server/db/queries/menu";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { getHotelSettings } from "@/server/db/queries/settings";
import { Reveal } from "@/components/public/reveal";
import { SplitHeading } from "@/components/public/split-heading";
import { Hairline } from "@/components/public/editorial-marks";

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
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <Reveal variant="fade-up">
          <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Dining</p>
        </Reveal>
        <SplitHeading trigger="scroll" by="words">
          <h1 className="font-display mt-2 text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
            {dining.heading}
          </h1>
        </SplitHeading>
        <Reveal variant="fade-up" delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">{dining.body}</p>
        </Reveal>
      </div>

      {categories.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Our menu is being updated — check back shortly.</p>
      ) : (
        <div className="mt-20 flex flex-col gap-16">
          {categories.map((category) => (
            <div key={category}>
              <Reveal variant="fade-up">
                <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">{category}</h2>
                <Hairline className="mt-3" />
              </Reveal>

              <Reveal stagger={0.08} className="mt-8 flex flex-col gap-7">
                {available
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <div key={item.id}>
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-display shrink-0 text-base font-medium text-foreground">
                          {item.name}
                        </h3>
                        {/* classic menu price-leader — a dotted rule connecting
                            dish name to price, in place of a plain justify-between
                            row; small typographic detail that reads as "menu,"
                            not "list of table rows" */}
                        <span
                          aria-hidden="true"
                          className="mb-1 h-px flex-1 border-b border-dotted border-line/80"
                        />
                        <p className="font-display shrink-0 text-foreground">
                          {settings.currency} {Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      {item.description && (
                        <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  ))}
              </Reveal>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}