"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { roomTypes as roomTypesTable } from "@/server/schema";
import { deleteRoomType } from "@/server/actions/rooms";
import { RoomTypeDialog } from "./room-type-dialog";

type RoomType = typeof roomTypesTable.$inferSelect;

export function RoomTypesTab({
    roomTypes,
    isAdmin,
}: {
    roomTypes: RoomType[];
    isAdmin: boolean;
}) {
    const [editing, setEditing] = useState<RoomType | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<RoomType | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDelete() {
        if (!deleting) return;
        const result = await deleteRoomType(deleting.id);
        if (!result.success) {
            setDeleteError(result.error);
            return;
        }
        setDeleting(null);
        setDeleteError(null);
    }

    return (
        <div className="space-y-4">
            {isAdmin && (
                <div className="flex justify-end">
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="size-4" />
                        New room type
                    </Button>
                </div>
            )}

            <DataTable<RoomType>
                data={roomTypes}
                emptyTitle="No room types yet"
                emptyDescription={isAdmin
                    ? "Create your first room type to start building inventory."
                    : "Room types haven't been set up yet."}
                getRowId={(roomType) => roomType.id}
                columns={[
                    { header: "Name", cell: (roomType: RoomType) => roomType.name },
                    {
                        header: "Base rate",
                        cell: (roomType: RoomType) => `$${Number(roomType.basePrice).toFixed(2)}`,
                    },
                    { header: "Max guests", cell: (roomType: RoomType) => roomType.maxGuests },
                    {
                        header: "Published",
                        cell: (roomType: RoomType) => (roomType.isPublished ? "Yes" : "No"),
                    },
                    {
                        header: "",
                        cell: (roomType: RoomType) =>
                            isAdmin ? (
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditing(roomType)}
                                        aria-label="Edit"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleting(roomType)}
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
                <RoomTypeDialog
                    roomType={editing}
                    onClose={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete "${deleting?.name}"?`}
                description={
                    deleteError ??
                    "This can't be undone. Rooms using this type must be removed or reassigned first."
                }
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}