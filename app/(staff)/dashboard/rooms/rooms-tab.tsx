"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { roomTypes as roomTypesTable, rooms as roomsTable } from "@/server/schema";
import { deleteRoom, updateRoomStatus } from "@/server/actions/rooms";
import { roomStatusValues } from "@/lib/validation/rooms";
import { RoomDialog } from "./room-dialog";

type RoomType = typeof roomTypesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect & { roomType: RoomType };

export function RoomsTab({
  rooms,
  roomTypes,
  isAdmin,
}: {
  rooms: Room[];
  roomTypes: RoomType[];
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState<Room | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(roomId: string, status: string) {
    startTransition(async () => {
      await updateRoomStatus({
        id: roomId,
        status: status as (typeof roomStatusValues)[number],
      });
    });
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteRoom(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={() => setCreating(true)}
            disabled={roomTypes.length === 0}
          >
            <Plus className="size-4" />
            New room
          </Button>
        </div>
      )}

      {roomTypes.length === 0 && isAdmin && (
        <p className="text-sm text-muted-foreground">
          Create a room type first — rooms need one to belong to.
        </p>
      )}

      <DataTable<Room>
        data={rooms}
        emptyTitle="No rooms yet"
        emptyDescription={isAdmin
          ? "Add physical rooms once you have at least one room type."
          : "No rooms have been added yet."}
        getRowId={(room) => room.id}
        columns={[
          { header: "Room #", cell: (room: Room) => room.roomNumber },
          { header: "Type", cell: (room: Room) => room.roomType.name },
          { header: "Floor", cell: (room: Room) => room.floor ?? "—" },
          {
            header: "Status",
            cell: (room: Room) => (
              <select
                value={room.status}
                disabled={isPending}
                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                {roomStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ),
          },
          {
            header: "",
            cell: (room: Room) =>
              isAdmin ? (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(room)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(room)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null,
          },
        ]}
      />

      {(creating || editing) && (
        <RoomDialog
          room={editing}
          roomTypes={roomTypes}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete room "${deleting?.roomNumber}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}