"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Pencil } from "lucide-react";
import { CONTENT_BLOCKS } from "@/lib/content-blocks";
import { Button } from "@/components/ui/button";
import { EditContentDialog } from "./edit-content-dialog";
import type { SiteContentRow } from "@/server/db/queries/content";

export function ContentBlocksList({ rows }: { rows: SiteContentRow[] }) {
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const rowByKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CONTENT_BLOCKS.map((block) => {
        const row = rowByKey.get(block.key);
        const values = { ...block.defaultValue, ...((row?.value as Record<string, string>) ?? {}) };
        const previewField = block.fields[0];
        const preview = previewField ? values[previewField.name] : undefined;

        return (
          <div key={block.key} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-foreground">{block.label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{block.description}</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setEditingKey(block.key)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>

            {preview && <p className="line-clamp-2 text-sm text-foreground/80 italic">&ldquo;{preview}&rdquo;</p>}

            <p className="text-xs text-muted-foreground">
              {row ? `Updated ${formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })}` : "Not yet customized — showing defaults"}
            </p>

            <EditContentDialog
              block={block}
              values={values}
              open={editingKey === block.key}
              onOpenChange={(open) => setEditingKey(open ? block.key : null)}
            />
          </div>
        );
      })}
    </div>
  );
}