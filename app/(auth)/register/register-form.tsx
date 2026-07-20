"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const darkFieldClass =
  "bg-abyss-elevated border-abyss-line text-abyss-foreground placeholder:text-abyss-foreground-muted focus-visible:ring-emerald";

const fields: { name: keyof RegisterInput; label: string; type: string; autoComplete: string }[] = [
  { name: "name", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email Address", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", autoComplete: "new-password" },
];

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message ?? "Couldn't create your account. Please try again.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-3xl font-medium">Create an account</h2>
        <p className="text-abyss-foreground-muted mt-2 text-sm">
          Book rooms and manage your stay at Baobab Hotel.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && (
          <p role="alert" className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label
              htmlFor={field.name}
              className="text-abyss-foreground-muted text-xs tracking-widest uppercase"
            >
              {field.label}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              className={darkFieldClass}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="text-sm text-red-300">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "bg-emerald hover:bg-emerald-hover text-emerald-foreground mt-2 h-11 w-full tracking-[0.08em] uppercase",
          )}
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="text-abyss-foreground-muted text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}