"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { roomTypes, rooms } from "@/server/schema";
import { getCurrentUser } from "@/server/auth/session";
import {
    roomTypeSchema,
    roomTypeUpdateSchema,
} from "@/lib/validation/room-types";
import {
    roomSchema,
    roomUpdateSchema,
    roomStatusUpdateSchema,
} from "@/lib/validation/rooms";
import { countRoomsByType } from "@/server/db/queries/rooms";

type ActionResult =
    | { success: true }
    | { success: false; error: string };

type UserRole = "admin" | "receptionist";

async function requireRole(allowed: UserRole[]) {
    const user = await getCurrentUser();
    if (!user || !allowed.includes(user.role as UserRole)) {
        throw new Error("Not authorized");
    }
    return user;
}

export async function createRoomType(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);
        const data = roomTypeSchema.parse(input);

        const existingSlug = await db.query.roomTypes.findFirst({
            where: eq(roomTypes.slug, data.slug),
        });
        if (existingSlug) {
            return { success: false, error: "That slug is already in use" };
        }

        // Convert basePrice to string before inserting
        await db.insert(roomTypes).values({
            ...data,
            basePrice: String(data.basePrice),
        });
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to create room type",
        };
    }
}

export async function updateRoomType(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);
        const { id, ...data } = roomTypeUpdateSchema.parse(input);

        if (data.slug) {
            const existingSlug = await db.query.roomTypes.findFirst({
                where: eq(roomTypes.slug, data.slug),
            });
            if (existingSlug && existingSlug.id !== id) {
                return { success: false, error: "That slug is already in use" };
            }
        }

        // Prepare update data with proper types
        const updateData: any = {
            ...data,
            updatedAt: new Date(),
        };

        // Convert basePrice to string if it exists
        if (data.basePrice !== undefined) {
            updateData.basePrice = String(data.basePrice);
        }

        await db
            .update(roomTypes)
            .set(updateData)
            .where(eq(roomTypes.id, id));
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to update room type",
        };
    }
}

export async function deleteRoomType(id: string): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);

        const roomCount = await countRoomsByType(id);
        if (roomCount > 0) {
            return {
                success: false,
                error: `Cannot delete — ${roomCount} room(s) still use this type`,
            };
        }

        await db.delete(roomTypes).where(eq(roomTypes.id, id));
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to delete room type",
        };
    }
}

// ---------- Rooms (admin only: create/edit/delete) ----------

export async function createRoom(input: unknown): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);
        const data = roomSchema.parse(input);

        const existingNumber = await db.query.rooms.findFirst({
            where: eq(rooms.roomNumber, data.roomNumber),
        });
        if (existingNumber) {
            return { success: false, error: "That room number already exists" };
        }

        await db.insert(rooms).values(data);
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to create room",
        };
    }
}

export async function updateRoom(input: unknown): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);
        const { id, ...data } = roomUpdateSchema.parse(input);

        if (data.roomNumber) {
            const existingNumber = await db.query.rooms.findFirst({
                where: eq(rooms.roomNumber, data.roomNumber),
            });
            if (existingNumber && existingNumber.id !== id) {
                return { success: false, error: "That room number already exists" };
            }
        }

        await db
            .update(rooms)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(rooms.id, id));
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to update room",
        };
    }
}

export async function deleteRoom(id: string): Promise<ActionResult> {
    try {
        await requireRole(["admin"]);
        await db.delete(rooms).where(eq(rooms.id, id));
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to delete room",
        };
    }
}

export async function updateRoomStatus(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireRole(["admin", "receptionist"]);
        const { id, status } = roomStatusUpdateSchema.parse(input);

        await db
            .update(rooms)
            .set({ status, updatedAt: new Date() })
            .where(eq(rooms.id, id));
        revalidatePath("/dashboard/rooms");
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to update status",
        };
    }
}