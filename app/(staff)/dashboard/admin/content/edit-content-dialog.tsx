"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateSiteContent } from "@/server/actions/content";
import { schemaForBlock, type ContentBlockConfig } from "@/lib/content-blocks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function EditContentDialog({
  block,
  values,
  open,
  onOpenChange,
}: {
  block: ContentBlockConfig;
  values: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const schema = schemaForBlock(block);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    values,
  });

  async function onSubmit(formValues: Record<string, string>) {
    setServerError(null);
    const result = await updateSiteContent(block.key, formValues);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{block.label}</DialogTitle>
          <DialogDescription>{block.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          {block.fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={`${block.key}-${field.name}`}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={`${block.key}-${field.name}`}
                  placeholder={field.placeholder}
                  aria-invalid={!!errors[field.name]}
                  {...register(field.name)}
                />
              ) : (
                <Input
                  id={`${block.key}-${field.name}`}
                  placeholder={field.placeholder}
                  aria-invalid={!!errors[field.name]}
                  {...register(field.name)}
                />
              )}
              {errors[field.name] && (
                <p className="text-sm text-destructive">{errors[field.name]?.message as string}</p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}