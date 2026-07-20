// src/app/(staff)/dashboard/rooms/room-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoom, updateRoom } from "@/server/actions/rooms";
import { roomStatusValues } from "@/lib/validation/rooms";
import type { roomTypes as roomTypesTable, rooms as roomsTable } from "@/server/schema";

type RoomType = typeof roomTypesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect & { roomType: RoomType };

export function RoomDialog({
    room,
    roomTypes,
    onClose,
}: {
    room: Room | null;
    roomTypes: RoomType[];
    onClose: () => void;
}) {
    const isEditing = Boolean(room);

    const [roomTypeId, setRoomTypeId] = useState(
        room?.roomTypeId ?? roomTypes[0]?.id ?? ""
    );
    const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? "");
    const [floor, setFloor] = useState(room?.floor ? String(room.floor) : "");
    const [status, setStatus] = useState(room?.status ?? "available");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        setIsSaving(true);
        setError(null);

        const payload = {
            roomTypeId,
            roomNumber,
            floor: floor || null,
            status,
        };

        const result = isEditing
            ? await updateRoom({ id: room!.id, ...payload })
            : await createRoom(payload);

        setIsSaving(false);
        if (!result.success) {
            setError(result.error);
            return;
        }
        onClose();
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>{isEditing ? "Edit room" : "New room"}</DialogTitle>

                <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Room type</label>
                        <select
                            value={roomTypeId}
                            onChange={(e) => setRoomTypeId(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                            {roomTypes.map((rt) => (
                                <option key={rt.id} value={rt.id}>
                                    {rt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Room number</label>
                            <Input
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                placeholder="204"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Floor</label>
                            <Input
                                type="number"
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                placeholder="2"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Status</label>
                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as (typeof roomStatusValues)[number])
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                            {roomStatusValues.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}