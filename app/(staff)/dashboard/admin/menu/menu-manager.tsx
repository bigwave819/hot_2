"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MenuItemDialog } from "./menu-item-dialog";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { setMenuItemAvailability, reorderMenuItem, deleteMenuItem } from "@/server/actions/menu";
import type { MenuItemRow } from "@/server/db/queries/menu";

export function MenuManager({ items }: { items: MenuItemRow[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState<{ open: boolean; category?: string }>({ open: false });
  const [editingItem, setEditingItem] = React.useState<MenuItemRow | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<MenuItemRow | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  async function handleDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    await deleteMenuItem(deletingItem.id);
    setIsDeleting(false);
    setDeletingItem(null);
    router.refresh();
  }

  const columns: DataTableColumn<MenuItemRow>[] = [
    {
      header: "",
      headerClassName: "w-14",
      cell: (item) =>
        item.cloudinaryPublicId ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md">
            <Image src={cloudinaryUrl(item.cloudinaryPublicId)} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-secondary" />
        ),
    },
    {
      header: "Item",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          {item.description && <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>}
        </div>
      ),
    },
    { header: "Price", cell: (item) => `RWF ${Number(item.price).toLocaleString()}` },
    {
      header: "Available",
      cell: (item) => (
        <Switch
          aria-label={`${item.name} available`}
          checked={item.isAvailable}
          onCheckedChange={async (checked) => {
            await setMenuItemAvailability(item.id, checked);
            router.refresh();
          }}
        />
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Move earlier"
            onClick={async () => {
              await reorderMenuItem(item.id, "up");
              router.refresh();
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Move later"
            onClick={async () => {
              await reorderMenuItem(item.id, "down");
              router.refresh();
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit item" onClick={() => setEditingItem(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive h-8 w-8"
            aria-label="Delete item"
            onClick={() => setDeletingItem(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen({ open: true })} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add menu item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Add your first dish or drink to start building the menu."
          action={
            <Button onClick={() => setAddOpen({ open: true })} className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add menu item
            </Button>
          }
        />
      ) : (
        categories.map((category) => (
          <div key={category} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-foreground">{category}</h2>
              <Button variant="outline" size="sm" onClick={() => setAddOpen({ open: true, category })} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add to {category}
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={items.filter((i) => i.category === category)}
              getRowId={(i) => i.id}
              emptyTitle="No items"
            />
          </div>
        ))
      )}

      <MenuItemDialog
        open={addOpen.open}
        onOpenChange={(open) => setAddOpen({ open })}
        categories={categories}
        defaultCategory={addOpen.category}
      />

      {editingItem && (
        <MenuItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          categories={categories}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          title="Delete this item?"
          description={`"${deletingItem.name}" will be removed from the menu. This can't be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isConfirming={isDeleting}
        />
      )}
    </div>
  );
}
