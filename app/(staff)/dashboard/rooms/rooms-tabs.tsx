"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { roomTypes as roomTypesTable, rooms as roomsTable } from "@/server/schema";
import { RoomTypesTab } from "./room-types-tab";
import { RoomsTab } from "./rooms-tab";

type RoomType = typeof roomTypesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect & { roomType: RoomType };

interface RoomsTabsProps {
  roomTypes: RoomType[];
  rooms: Room[];
  isAdmin: boolean;
}

const TABS = [
  { key: "room-types", label: "Room Types" },
  { key: "rooms", label: "Rooms" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function RoomsTabs({ roomTypes, rooms, isAdmin }: RoomsTabsProps) {
  const [active, setActive] = useState<TabKey>("room-types");

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {active === "room-types" && (
          <RoomTypesTab roomTypes={roomTypes} isAdmin={isAdmin} />
        )}
        {active === "rooms" && (
          <RoomsTab rooms={rooms} roomTypes={roomTypes} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}