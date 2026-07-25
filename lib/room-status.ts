import type { roomStatusEnum } from "@/server/schema/enums";

export type RoomStatus = (typeof roomStatusEnum.enumValues)[number];

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

export const ROOM_STATUS_VARIANT: Record<RoomStatus, "default" | "success" | "warning" | "destructive" | "info"> = {
  available: "success",
  reserved: "info",
  occupied: "default",
  cleaning: "warning",
  maintenance: "destructive",
};