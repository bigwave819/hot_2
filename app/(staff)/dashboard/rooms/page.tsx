import { PageHeader } from "@/components/shared/page-header";
import { getRoomTypes, getRooms } from "@/server/db/queries/rooms";
import { getCurrentUser } from "@/server/auth/session";
import { RoomsTabs } from "./rooms-tabs";

export default async function RoomsPage() {
  const [roomTypes, rooms, user] = await Promise.all([
    getRoomTypes(),
    getRooms(),
    getCurrentUser(),
  ]);

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms & Room Types"
        description="Manage sellable room types and the live status of physical rooms."
      />
      <RoomsTabs roomTypes={roomTypes} rooms={rooms} isAdmin={isAdmin} />
    </div>
  );
}